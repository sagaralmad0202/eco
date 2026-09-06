const logger = require("../logger");

// Bounded per-policy totals are observability only; enforcement lives in Redis.
// No user, IP, email, token or raw URL enters the log.
const events = new Map();
function recordEvent(policy, event) {
  const key = `${policy}:${event}`;
  const now = Date.now();
  const entry = events.get(key) || { count: 0, loggedAt: 0 };
  entry.count += 1;
  if (!entry.loggedAt || now - entry.loggedAt >= 60000) {
    logger.warn({ policy, event, count: entry.count }, "Rate limiter event");
    entry.loggedAt = now;
  }
  events.set(key, entry);
}
function setRateLimitHeaders(res, result) {
  if (result.failedOpen || result.failedClosed || result.disabled) return;
  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);
  // First time another slot opens, from Redis time, on both 2xx and 429.
  res.setHeader("X-RateLimit-Reset", result.resetTime);
}
function sendRateLimitResponse(req, res, result, policy) {
  setRateLimitHeaders(res, result);
  res.setHeader("Retry-After", result.retryAfter);
  req.rateLimitHandled = true;
  recordEvent(policy, result.failedClosed ? "unavailable_closed" : "rejected");
  return res.status(result.failedClosed ? 503 : 429).json({
    success: false,
    message: result.failedClosed
      ? "Service temporarily unavailable. Please try again later."
      : "Too many requests. Please try again later.",
    retryAfter: result.retryAfter,
    requestId: req.id,
  });
}
module.exports = { recordEvent, setRateLimitHeaders, sendRateLimitResponse };
