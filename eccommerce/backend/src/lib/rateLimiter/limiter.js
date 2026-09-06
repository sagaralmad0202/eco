const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { executeRedisScript } = require("../redis");
const env = require("../../config/env");
const LUA_SCRIPT = fs.readFileSync(
  path.join(__dirname, "slidingWindow.lua"),
  "utf8",
);

async function checkSlidingWindow(
  key,
  limit,
  windowMs,
  { failOpen = env.RATE_LIMIT_FAIL_OPEN } = {},
) {
  if (!env.RATE_LIMIT_ENABLED)
    return { allowed: true, limit, remaining: limit, disabled: true };
  try {
    const result = await executeRedisScript(
      "slidingWindowV1",
      LUA_SCRIPT,
      [key],
      [windowMs, limit, crypto.randomBytes(16).toString("hex")],
    );
    if (
      !Array.isArray(result) ||
      result.length !== 4 ||
      result.some((value) => !Number.isFinite(Number(value)))
    ) {
      throw new Error("Invalid rate limiter result");
    }
    return {
      allowed: Number(result[0]) === 1,
      limit,
      remaining: Number(result[1]),
      retryAfter: Number(result[2]),
      resetTime: Number(result[3]),
    };
  } catch {
    return {
      allowed: failOpen,
      limit,
      remaining: failOpen ? limit : 0,
      retryAfter: 1,
      failedOpen: failOpen,
      failedClosed: !failOpen,
    };
  }
}
module.exports = { checkSlidingWindow, LUA_SCRIPT };
