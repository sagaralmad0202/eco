// Reserve account capacity before bcrypt, then finish the reservation after
// authentication. Redis shares failures and in-flight attempts across instances;
// unanswered leases count as failures. Login fails closed on outages or expiry.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { executeRedisScript } = require("../lib/redis");
const { identityDigest, makeKey } = require("../lib/rateLimiter/keys");
const {
  recordEvent,
  sendRateLimitResponse,
} = require("../lib/rateLimiter/response");

const POLICY = "login-account";
const LUA_SCRIPT = fs.readFileSync(
  path.join(__dirname, "../lib/rateLimiter/loginAttempts.lua"),
  "utf8",
);

function unavailableResult() {
  return {
    allowed: false,
    limit: env.LOGIN_MAX_ATTEMPTS,
    remaining: 0,
    retryAfter: 1,
    resetTime: Math.ceil(Date.now() / 1000) + 1,
    failedClosed: true,
  };
}

async function updateAttempt(operation, attempt) {
  const result = await executeRedisScript(
    "loginAttempts",
    LUA_SCRIPT,
    [attempt.key],
    [
      operation,
      env.LOGIN_MAX_ATTEMPTS,
      env.LOGIN_WINDOW_MS,
      env.LOGIN_BLOCK_DURATION_MS,
      env.LOGIN_ATTEMPT_LEASE_MS,
      attempt.reservationId,
      attempt.generation,
    ],
  );

  return {
    allowed: Number(result[0]) === 1,
    limit: env.LOGIN_MAX_ATTEMPTS,
    remaining: Number(result[1]),
    retryAfter: Number(result[2]),
    resetTime: Number(result[3]),
    generation: result[4],
  };
}

async function loginThrottle(req, res, next) {
  if (env.RATE_LIMIT_ENABLED === false) return next();

  // The route validates first; keep missing email harmless for direct callers.
  const email = req.body?.email;
  if (typeof email !== "string" || !email.trim()) return next();

  const attempt = {
    key: makeKey(POLICY, identityDigest("email", email.trim().toLowerCase())),
    reservationId: crypto.randomUUID(),
    generation: crypto.randomUUID(),
  };

  let result;
  try {
    result = await updateAttempt("acquire", attempt);
  } catch {
    return sendRateLimitResponse(req, res, unavailableResult(), POLICY);
  }

  if (!result.allowed) {
    return sendRateLimitResponse(req, res, result, POLICY);
  }

  req.loginAttempt = { ...attempt, generation: result.generation };
  return next();
}

async function completeLoginAttempt(req, outcome) {
  if (env.RATE_LIMIT_ENABLED === false || !req.loginAttempt) return;
  if (!["success", "failure", "release"].includes(outcome)) {
    throw new TypeError("Unknown login attempt outcome");
  }

  const attempt = req.loginAttempt;
  delete req.loginAttempt;
  try {
    const result = await updateAttempt(outcome, attempt);
    if (!result.allowed) throw new Error("Login reservation expired");
  } catch {
    recordEvent(POLICY, "unavailable_closed");
    const error = ApiError.serviceUnavailable(
      "Service temporarily unavailable. Please try again later.",
    );
    error.rateLimitUnavailable = true;
    throw error;
  }
}

module.exports = { loginThrottle, completeLoginAttempt };
