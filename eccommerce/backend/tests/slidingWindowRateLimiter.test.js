const express = require("express");
const request = require("supertest");
const RedisMock = require("ioredis-mock");
const {
  _setRedisClientForTesting,
  closeRedis,
} = require("../src/lib/redis");
const {
  checkSlidingWindow,
} = require("../src/lib/rateLimiter/limiter");
const {
  createRateLimiterMiddleware,
  resolveClientIdentifier,
  resolvePolicy,
} = require("../src/middleware/rateLimiter");
const { signAccessToken } = require("../src/utils/jwt");
const env = require("../src/config/env");

describe("Distributed Sliding Window Rate Limiter", () => {
  let redisMock;

  beforeEach(() => {
    redisMock = new RedisMock();
    _setRedisClientForTesting(redisMock, true);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeRedis();
  });

  describe("Core Sliding Window Algorithm (Lua Script & Redis ZSET)", () => {
    test("Test 1 — Requests under limit: allows requests and decrements remaining quota", async () => {
      const key = "test:user:101:GET:/api/products";
      const limit = 5;
      const windowMs = 60000;

      for (let i = 1; i <= limit; i++) {
        const result = await checkSlidingWindow(key, limit, windowMs);
        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(5);
        expect(result.remaining).toBe(limit - i);
        expect(result.retryAfter).toBe(0);
      }
    });

    test("Test 2 — Request exceeding limit: rejects with 429 metrics and valid retryAfter", async () => {
      const key = "test:user:102:GET:/api/products";
      const limit = 5;
      const windowMs = 60000;

      for (let i = 0; i < 5; i++) {
        await checkSlidingWindow(key, limit, windowMs);
      }

      // 6th request must be rejected
      const rejected = await checkSlidingWindow(key, limit, windowMs);
      expect(rejected.allowed).toBe(false);
      expect(rejected.remaining).toBe(0);
      expect(rejected.retryAfter).toBeGreaterThanOrEqual(1);
      expect(rejected.retryAfter).toBeLessThanOrEqual(60);
    });

    test("Test 3 — Sliding behavior: allows new requests once oldest timestamp leaves window", async () => {
      const key = "test:user:103:GET:/api/cart";
      const limit = 2;
      const windowMs = 1000; // 1 second window

      const r1 = await checkSlidingWindow(key, limit, windowMs);
      const r2 = await checkSlidingWindow(key, limit, windowMs);
      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);

      // Immediately blocked
      const rBlocked = await checkSlidingWindow(key, limit, windowMs);
      expect(rBlocked.allowed).toBe(false);

      // Wait 1.1s for the 1-second window to slide past the old requests
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const rAllowed = await checkSlidingWindow(key, limit, windowMs);
      expect(rAllowed.allowed).toBe(true);
      expect(rAllowed.remaining).toBe(1);
    });

    test("Test 4 — Different users: User A reaching limit does NOT block User B", async () => {
      const keyUserA = "test:user:A:POST:/api/reviews";
      const keyUserB = "test:user:B:POST:/api/reviews";
      const limit = 3;
      const windowMs = 60000;

      // Exhaust User A
      for (let i = 0; i < limit; i++) {
        await checkSlidingWindow(keyUserA, limit, windowMs);
      }
      const blockedA = await checkSlidingWindow(keyUserA, limit, windowMs);
      expect(blockedA.allowed).toBe(false);

      // User B should still have full quota
      const allowedB = await checkSlidingWindow(keyUserB, limit, windowMs);
      expect(allowedB.allowed).toBe(true);
      expect(allowedB.remaining).toBe(2);
    });

    test("Test 5 — Different IPs: Unauthenticated requests from different IPs have independent limits", async () => {
      const keyIp1 = "test:ip:192.168.1.1:POST:/api/auth/login";
      const keyIp2 = "test:ip:10.0.0.1:POST:/api/auth/login";
      const limit = 2;
      const windowMs = 60000;

      // Exhaust IP 1
      await checkSlidingWindow(keyIp1, limit, windowMs);
      await checkSlidingWindow(keyIp1, limit, windowMs);
      const blockedIp1 = await checkSlidingWindow(keyIp1, limit, windowMs);
      expect(blockedIp1.allowed).toBe(false);

      // IP 2 is unaffected
      const allowedIp2 = await checkSlidingWindow(keyIp2, limit, windowMs);
      expect(allowedIp2.allowed).toBe(true);
      expect(allowedIp2.remaining).toBe(1);
    });

    test("Test 6 — Different endpoints: User reaching limit on one endpoint does not consume quota of another", async () => {
      const keyAuth = "test:auth:user:500:POST:/api/auth/login";
      const keyProducts = "test:general:user:500:GET:/api/products";
      const limit = 2;
      const windowMs = 60000;

      // Exhaust Auth endpoint
      await checkSlidingWindow(keyAuth, limit, windowMs);
      await checkSlidingWindow(keyAuth, limit, windowMs);
      const blockedAuth = await checkSlidingWindow(keyAuth, limit, windowMs);
      expect(blockedAuth.allowed).toBe(false);

      // Products endpoint is unaffected
      const allowedProducts = await checkSlidingWindow(
        keyProducts,
        100,
        windowMs,
      );
      expect(allowedProducts.allowed).toBe(true);
      expect(allowedProducts.remaining).toBe(99);
    });

    test("Test 7 — Concurrent requests: Atomic evaluation prevents race conditions exceeding limit", async () => {
      const key = "test:concurrent:user:999:POST:/api/cart";
      const limit = 5;
      const windowMs = 60000;

      // Fire 15 concurrent requests simultaneously
      const results = await Promise.all(
        Array.from({ length: 15 }, () =>
          checkSlidingWindow(key, limit, windowMs),
        ),
      );

      const allowedCount = results.filter((r) => r.allowed).length;
      const deniedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(limit); // Exactly 5 allowed
      expect(deniedCount).toBe(10); // Exactly 10 rejected
    });

    test("Test 8 — Redis failure: Fail-open allows request with logged warning; Fail-closed rejects", async () => {
      const brokenRedis = {
        eval: jest.fn().mockRejectedValue(new Error("Connection refused")),
      };
      _setRedisClientForTesting(brokenRedis, false);

      const key = "test:failover:user:1:GET:/api/products";

      // Case A: RATE_LIMIT_FAIL_OPEN = true
      env.RATE_LIMIT_FAIL_OPEN = true;
      const failOpenResult = await checkSlidingWindow(key, 5, 60000);
      expect(failOpenResult.allowed).toBe(true);
      expect(failOpenResult.failedOpen).toBe(true);

      // Case B: RATE_LIMIT_FAIL_OPEN = false
      env.RATE_LIMIT_FAIL_OPEN = false;
      const failClosedResult = await checkSlidingWindow(key, 5, 60000);
      expect(failClosedResult.allowed).toBe(false);
      expect(failClosedResult.failedClosed).toBe(true);

      // Restore
      env.RATE_LIMIT_FAIL_OPEN = true;
    });
  });

  describe("Express Middleware Integration & HTTP Behavior", () => {
    let app;

    beforeEach(() => {
      app = express();
      app.set("trust proxy", 1);
      app.use(express.json());
      app.use(
        createRateLimiterMiddleware({
          category: "test",
          limit: 3,
          windowMs: 60000,
        }),
      );

      app.get("/test", (req, res) => res.json({ success: true }));
      app.get("/api/health", (req, res) => res.json({ status: "healthy" }));
      app.get("/docs", (req, res) => res.json({ docs: true }));
    });

    test("emits rate limit headers on allowed requests", async () => {
      const res = await request(app).get("/test");

      expect(res.status).toBe(200);
      expect(res.headers["x-ratelimit-limit"]).toBe("3");
      expect(res.headers["x-ratelimit-remaining"]).toBe("2");
      expect(res.headers["x-ratelimit-reset"]).toBeDefined();
    });

    test("returns HTTP 429 with standard JSON format and Retry-After header when exceeded", async () => {
      await request(app).get("/test");
      await request(app).get("/test");
      await request(app).get("/test");

      // 4th request exceeds limit
      const res = await request(app).get("/test");

      expect(res.status).toBe(429);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Too many requests. Please try again later.",
      );
      expect(res.headers["retry-after"]).toBeDefined();
      expect(Number(res.headers["retry-after"])).toBeGreaterThanOrEqual(1);
    });

    test("bypasses health check and documentation endpoints", async () => {
      // Exceed quota on /test
      for (let i = 0; i < 4; i++) {
        await request(app).get("/test");
      }

      // /api/health and /docs should still respond 200 without rate limiting
      const healthRes = await request(app).get("/api/health");
      expect(healthRes.status).toBe(200);
      expect(healthRes.body.status).toBe("healthy");

      const docsRes = await request(app).get("/docs");
      expect(docsRes.status).toBe(200);
    });

    test("identifies authenticated users via Bearer token without database queries", async () => {
      const userToken = signAccessToken({ id: "user-abc-123", role: "CUSTOMER" });

      const req = {
        headers: { authorization: `Bearer ${userToken}` },
        ip: "127.0.0.1",
      };

      const client = resolveClientIdentifier(req);
      expect(client.type).toBe("user");
      expect(client.id).toBe("user-abc-123");
      expect(client.key).toBe("user:user-abc-123");
    });

    test("admin users bypass rate limiting", async () => {
      const adminToken = signAccessToken({ id: "admin-master", role: "ADMIN" });

      // Admin makes 10 requests when limit is 3
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .get("/test")
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
      }
    });

    test("correctly maps categories to routes", () => {
      expect(resolvePolicy("POST", "/api/auth/login").category).toBe("auth");
      expect(resolvePolicy("POST", "/api/upload").category).toBe("expensive");
      expect(resolvePolicy("POST", "/api/cart").category).toBe("write");
      expect(resolvePolicy("GET", "/api/products").category).toBe("general");
      expect(resolvePolicy("GET", "/api/health").category).toBe("EXEMPT");
    });
  });
});
