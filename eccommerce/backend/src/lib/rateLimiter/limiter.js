const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getRedisClient, isRedisReady } = require("../redis");
const env = require("../../config/env");
const logger = require("../logger");

const LUA_SCRIPT = fs.readFileSync(
  path.join(__dirname, "slidingWindow.lua"),
  "utf8",
);

/**
 * Evaluates rate limit for a specific key atomically using Redis.
 *
 * @param {string} key - Full Redis key (e.g. rate_limit:auth:ip:127.0.0.1:POST:/api/auth/login)
 * @param {number} limit - Maximum requests allowed in the window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{ allowed: boolean, limit: number, remaining: number, retryAfter: number, resetTime: number }>}
 */
async function checkSlidingWindow(key, limit, windowMs) {
  const now = Date.now();
  const member = `${now}:${crypto.randomBytes(8).toString("hex")}`;
  const ttlSeconds = Math.ceil(windowMs / 1000) + 2;

  // If rate limiting is disabled globally (e.g. in certain testing scenarios)
  if (!env.RATE_LIMIT_ENABLED) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      retryAfter: 0,
      resetTime: Math.ceil((now + windowMs) / 1000),
    };
  }

  const client = getRedisClient();

  // If Redis is not connected / ready, fail fast in 0ms without waiting for timeouts
  if (
    client.status &&
    client.status !== "ready" &&
    client.status !== "connect"
  ) {
    if (env.RATE_LIMIT_FAIL_OPEN) {
      return {
        allowed: true,
        limit,
        remaining: limit,
        retryAfter: 0,
        resetTime: Math.ceil((now + windowMs) / 1000),
        failedOpen: true,
      };
    }
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil(windowMs / 1000),
      resetTime: Math.ceil((now + windowMs) / 1000),
      failedClosed: true,
    };
  }

  try {
    // Execute atomic Lua script
    const result = await client.eval(
      LUA_SCRIPT,
      1,
      key,
      now,
      windowMs,
      limit,
      member,
      ttlSeconds,
    );

    const allowed = Number(result[0]) === 1;
    const remaining = Math.max(0, Number(result[1]));
    const retryAfter = Math.max(0, Number(result[2]));
    const resetTime = Number(result[3]);

    return {
      allowed,
      limit,
      remaining,
      retryAfter,
      resetTime,
    };
  } catch (err) {
    logger.warn(
      { err: err.message, key, limit, windowMs },
      "Redis rate limiter evaluation error",
    );

    // Fail-open or Fail-closed policy
    if (env.RATE_LIMIT_FAIL_OPEN) {
      return {
        allowed: true,
        limit,
        remaining: limit,
        retryAfter: 0,
        resetTime: Math.ceil((now + windowMs) / 1000),
        failedOpen: true,
      };
    }

    // Fail-closed
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil(windowMs / 1000),
      resetTime: Math.ceil((now + windowMs) / 1000),
      failedClosed: true,
    };
  }
}

module.exports = {
  checkSlidingWindow,
  LUA_SCRIPT,
};
