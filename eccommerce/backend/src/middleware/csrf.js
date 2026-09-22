const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Webhook endpoints that use independent cryptographic signature verification
const EXEMPT_PATHS = new Set([
  "/api/payments/webhook",
]);

function parseOrigin(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const list = (env.CLIENT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (env.NODE_ENV === "development") {
    // Include common local dev origins
    list.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    );
  }

  return new Set(list);
}

/**
 * Defense-in-depth CSRF protection for cookie-authenticated applications.
 *
 * 1. Requires a custom header (e.g. X-Requested-With: XMLHttpRequest) on state-changing
 *    requests, which simple cross-origin forms cannot set without CORS preflight approval.
 * 2. Validates Origin or Referer header against authorized client origins.
 */
function csrfProtection(req, res, next) {
  // Safe read-only methods do not modify server state
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  // Exempt paths (like webhook callbacks verified by HMAC)
  if (EXEMPT_PATHS.has(req.path) || req.originalUrl?.startsWith("/api/payments/webhook")) {
    return next();
  }

  // Allow non-browser server-to-server or testing requests that use Bearer auth without cookies
  const hasAuthCookie = Boolean(req.cookies?.accessToken || req.cookies?.refreshToken);
  const isBearerOnly = Boolean(req.headers?.authorization?.startsWith("Bearer ") && !hasAuthCookie);
  if (isBearerOnly) {
    return next();
  }

  // 1. Validate Origin or Referer
  const originHeader = req.headers?.origin;
  const refererHeader = req.headers?.referer;
  const requestOrigin = originHeader || (refererHeader ? parseOrigin(refererHeader) : null);
  const allowedOrigins = getAllowedOrigins();

  if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
    return next(ApiError.forbidden("CSRF protection: request origin not allowed"));
  }

  // 2. Require anti-CSRF header for cookie-authenticated mutating requests
  const customHeader = req.headers?.["x-requested-with"] || req.headers?.["x-csrf-protection"];
  if (hasAuthCookie && !customHeader) {
    return next(ApiError.forbidden("CSRF protection: missing anti-CSRF request header"));
  }

  next();
}

module.exports = csrfProtection;
module.exports.csrfProtection = csrfProtection;
