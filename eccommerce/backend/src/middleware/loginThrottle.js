// Per-account brute-force protection.
//
// IP-based rate limiting (express-rate-limit in auth.routes.js) stops one
// machine from hammering login, but a botnet rotates IPs freely. This
// middleware tracks failed attempts by normalised email so that rotating
// source addresses does not help.
//
// Design choices:
//
//   1. In-memory Map, not Redis. This backend runs as a single process on
//      Render. Adding a Redis dependency for one counter table would be
//      overengineering; if the app ever scales to multiple instances, swap
//      the Map for a Redis hash and nothing else changes.
//
//   2. Temporary cooldown, not permanent lockout. A permanent lock turns
//      this endpoint into a free denial-of-service against any email address
//      — an attacker locks every customer out by failing five times on
//      purpose. A cooldown that decays on its own is the safe default.
//
//   3. The throttle fires BEFORE bcrypt. An attacker who is already blocked
//      should not burn 250 ms of CPU per attempt.

const ApiError = require("../utils/ApiError");
const env = require("../config/env");

// { normalisedEmail -> { count, firstAttempt, blockedUntil } }
const attempts = new Map();

// Prevent unbounded growth: sweep entries older than the window + block
// duration every 10 minutes. An entry that has expired cannot influence
// future requests, so deleting it is safe.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const sweepTimer = setInterval(() => {
  const now = Date.now();
  const maxAge = env.LOGIN_WINDOW_MS + env.LOGIN_BLOCK_DURATION_MS;

  for (const [key, entry] of attempts) {
    const age = now - entry.firstAttempt;
    const blockExpired = !entry.blockedUntil || now > entry.blockedUntil;

    if (age > maxAge && blockExpired) {
      attempts.delete(key);
    }
  }
}, SWEEP_INTERVAL_MS);

// Do not hold the process open purely for cleanup.
sweepTimer.unref();

/**
 * Middleware: reject the request if the target account has exceeded the
 * failure threshold. Must run BEFORE the login handler.
 *
 * Reads `req.body.email` (already validated by zod at this point).
 */
function loginThrottle(req, res, next) {
  const email = (req.body?.email ?? "").trim().toLowerCase();
  if (!email) return next();

  const entry = attempts.get(email);
  if (!entry) return next();

  // An active block that has not yet expired.
  if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
    const retryAfterSec = Math.ceil((entry.blockedUntil - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfterSec);
    return next(
      new ApiError(
        429,
        `Too many failed login attempts. Try again in ${retryAfterSec} seconds.`,
      ),
    );
  }

  // Block expired — reset so the user gets a fresh window.
  if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
    attempts.delete(email);
  }

  next();
}

/**
 * Call after a login attempt fails (wrong password, inactive account, etc.).
 * Increments the counter and activates the cooldown when the threshold is
 * reached.
 */
function recordLoginFailure(email) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  let entry = attempts.get(key);

  if (!entry || now - entry.firstAttempt > env.LOGIN_WINDOW_MS) {
    // First failure, or the previous window has expired.
    entry = { count: 1, firstAttempt: now, blockedUntil: null };
    attempts.set(key, entry);
    return;
  }

  entry.count += 1;

  if (entry.count >= env.LOGIN_MAX_ATTEMPTS) {
    entry.blockedUntil = now + env.LOGIN_BLOCK_DURATION_MS;
  }
}

/**
 * Call after a successful login. Clears the failure record so a legitimate
 * user who mistyped once does not carry that strike forever.
 */
function clearLoginFailures(email) {
  attempts.delete(email.trim().toLowerCase());
}

// Exposed for testing only.
function _resetStore() {
  attempts.clear();
}

module.exports = {
  loginThrottle,
  recordLoginFailure,
  clearLoginFailures,
  _resetStore,
};
