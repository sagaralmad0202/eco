const env = require("../config/env");
const logger = require("../lib/logger");
const { checkSlidingWindow } = require("../lib/rateLimiter/limiter");
const { verifyAccessToken } = require("../utils/jwt");

// UUID regex to collapse dynamic IDs in paths (e.g. /api/products/81606e58-d9a7-445a-b382-9b47f602e1eb -> /api/products/:id)
const UUID_REGEX =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

/**
 * Normalizes request paths to prevent high-cardinality keys in Redis.
 * E.g., replaces UUIDs and numbers with :id placeholders.
 */
function normalizePath(rawPath) {
  return rawPath
    .split("?")[0]
    .replace(UUID_REGEX, ":id")
    .replace(/\/+$/, "") || "/";
}

/**
 * Resolves the client identifier.
 * Authenticated users: user:{userId} (via req.user or cryptographically verified Bearer token without DB hit).
 * Unauthenticated guests: ip:{clientIp} (via trusted req.ip).
 */
function resolveClientIdentifier(req) {
  // If req.user is already populated by prior auth middleware
  if (req.user?.id) {
    return {
      type: "user",
      id: req.user.id,
      role: req.user.role || "CUSTOMER",
      key: `user:${req.user.id}`,
    };
  }

  // If Authorization header is present, verify token signature in-memory (0 database calls)
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7).trim();
      const payload = verifyAccessToken(token);
      if (payload?.sub) {
        return {
          type: "user",
          id: payload.sub,
          role: payload.role || "CUSTOMER",
          key: `user:${payload.sub}`,
        };
      }
    } catch {
      // Malformed or expired token will be properly handled by route auth middleware later.
      // Fallback to IP for rate limiting this request.
    }
  }

  // Fallback to trusted client IP
  const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";
  return {
    type: "ip",
    id: clientIp,
    role: null,
    key: `ip:${clientIp}`,
  };
}

/**
 * Determines the rate limiting policy category based on method and normalized route.
 */
function resolvePolicy(method, path) {
  // 1. Health checks & static assets are exempt
  if (
    path === "/health" ||
    path === "/api/health" ||
    path.startsWith("/docs") ||
    path.startsWith("/media")
  ) {
    return { category: "EXEMPT", limit: Infinity, exempt: true };
  }

  // 2. Authentication endpoints: brute-force sensitive (5 / 60s)
  const isAuthRoute =
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/forgot-password") ||
    path.startsWith("/api/auth/reset-password") ||
    path.startsWith("/api/auth/verify-email") ||
    path.startsWith("/api/auth/resend-verification");

  if (isAuthRoute) {
    return {
      category: "auth",
      limit: env.RATE_LIMIT_AUTH_MAX_REQUESTS,
      windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    };
  }

  // 3. Expensive operations: uploads, payment initiation, checkout (5 / 60s)
  const isExpensiveRoute =
    path.startsWith("/api/upload") ||
    path.startsWith("/api/payments/razorpay/create-order") ||
    path.startsWith("/api/payments/razorpay/verify") ||
    path.startsWith("/api/orders/checkout");

  if (isExpensiveRoute) {
    return {
      category: "expensive",
      limit: env.RATE_LIMIT_EXPENSIVE_MAX_REQUESTS,
      windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    };
  }

  // 4. Mutation / Write operations: POST, PUT, PATCH, DELETE (30 / 60s)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return {
      category: "write",
      limit: env.RATE_LIMIT_WRITE_MAX_REQUESTS,
      windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    };
  }

  // 5. General read traffic: GET, HEAD, OPTIONS (100 / 60s)
  return {
    category: "general",
    limit: env.RATE_LIMIT_GENERAL_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
  };
}

/**
 * Distributed Sliding Window Rate Limiting Middleware.
 * Replaces in-memory fixed-window counters with atomic Redis Sorted Set evaluation.
 */
function createRateLimiterMiddleware(customOptions = {}) {
  return async function rateLimiter(req, res, next) {
    const rawPath = req.originalUrl || req.url || "/";
    const normalizedPath = normalizePath(rawPath);
    const method = req.method.toUpperCase();

    // Determine policy
    const policy = customOptions.category
      ? {
          category: customOptions.category,
          limit: customOptions.limit || env.RATE_LIMIT_GENERAL_MAX_REQUESTS,
          windowMs:
            customOptions.windowMs || env.RATE_LIMIT_WINDOW_SECONDS * 1000,
        }
      : resolvePolicy(method, normalizedPath);

    // Bypass exempt endpoints
    if (policy.exempt || policy.limit === Infinity) {
      return next();
    }

    // Resolve client identifier
    const client = resolveClientIdentifier(req);

    // Admin bypass: administrative tasks are not throttled
    if (client.role === "ADMIN") {
      return next();
    }

    // Build the Redis key
    const redisKey = `rate_limit:${policy.category}:${client.key}:${method}:${normalizedPath}`;

    const result = await checkSlidingWindow(
      redisKey,
      policy.limit,
      policy.windowMs,
    );

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", result.resetTime);

    if (result.allowed) {
      return next();
    }

    // Rate limit exceeded: set Retry-After and return 429
    res.setHeader("Retry-After", result.retryAfter);

    // Structured warning log (NO passwords, tokens, or cookies)
    logger.warn(
      {
        identifier: client.key,
        route: normalizedPath,
        method,
        category: policy.category,
        limit: result.limit,
        window: `${policy.windowMs / 1000}s`,
        retryAfter: result.retryAfter,
        reqId: req.id,
      },
      "Rate limit exceeded",
    );

    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      retryAfter: result.retryAfter,
      requestId: req.id,
    });
  };
}

module.exports = {
  rateLimiter: createRateLimiterMiddleware(),
  createRateLimiterMiddleware,
  resolveClientIdentifier,
  resolvePolicy,
  normalizePath,
};
