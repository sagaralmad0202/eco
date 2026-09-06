const env = require("../config/env");
const { checkSlidingWindow } = require("../lib/rateLimiter/limiter");
const { verifyAccessToken } = require("../utils/jwt");
const {
  normalizeIp,
  identityDigest,
  makeKey,
} = require("../lib/rateLimiter/keys");
const { resolvePolicies } = require("../lib/rateLimiter/policies");
const {
  recordEvent,
  setRateLimitHeaders,
  sendRateLimitResponse,
} = require("../lib/rateLimiter/response");

function resolveClientIdentifier(req, strategy = "user-or-ip") {
  if (strategy !== "ip") {
    if (req.user?.id) return { type: "user", id: req.user.id };
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
      try {
        const payload = verifyAccessToken(header.slice(7).trim());
        if (typeof payload.sub === "string" && payload.sub)
          return { type: "user", id: payload.sub };
      } catch {
        // Route auth retains its 401 behavior; bad tokens cannot invent buckets.
      }
    }
  }
  return {
    type: "ip",
    id: normalizeIp(req.ip || req.socket?.remoteAddress || "unknown"),
  };
}
function createRateLimiterMiddleware({ method, route } = {}) {
  if (!route) throw new TypeError("A canonical registered route is required");
  return async function rateLimiter(req, res, next) {
    if (!env.RATE_LIMIT_ENABLED) return next();
    try {
      const policies = resolvePolicies(method || req.method, route);
      let primary;
      for (const policy of policies) {
        const client = resolveClientIdentifier(req, policy.identity);
        const key = makeKey(policy.id, identityDigest(client.type, client.id));
        const result = await checkSlidingWindow(
          key,
          policy.limit,
          policy.windowMs,
          {
            failOpen: policy.failOpen,
            policy: policy.id,
          },
        );
        if (!result.allowed)
          return sendRateLimitResponse(req, res, result, policy.id);
        if (result.failedOpen) recordEvent(policy.id, "unavailable_open");
        primary ||= result;
      }
      setRateLimitHeaders(res, primary);
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
module.exports = { createRateLimiterMiddleware, resolveClientIdentifier };
