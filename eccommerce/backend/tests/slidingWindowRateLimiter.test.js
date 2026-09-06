jest.mock("../src/lib/logger", () => require("pino")({ level: "silent" }));
jest.mock("../src/lib/prisma", () => ({
  $queryRaw: jest.fn(),
  user: { findUnique: jest.fn() },
}));
jest.mock("../src/modules/products/product.service", () => ({
  listProducts: jest.fn(),
  listCategories: jest.fn(),
  getProductBySlug: jest.fn(),
  createProduct: jest.fn(),
}));
jest.mock("../src/modules/auth/oauth.service", () => ({
  createState: jest.fn(),
  pruneExpiredStates: jest.fn(),
  handleCallback: jest.fn(),
  consumeExchangeCode: jest.fn(),
}));

const request = require("supertest");
const RedisMock = require("ioredis-mock");
const env = require("../src/config/env");
const prisma = require("../src/lib/prisma");
const productService = require("../src/modules/products/product.service");
const oauthService = require("../src/modules/auth/oauth.service");
const { _setRedisClientForTesting, closeRedis } = require("../src/lib/redis");
const { checkSlidingWindow } = require("../src/lib/rateLimiter/limiter");
const { resolveClientIdentifier } = require("../src/middleware/rateLimiter");
const { signAccessToken } = require("../src/utils/jwt");
const app = require("../src/app");

const originalEnv = { ...env };
const CLOCK_KEY = "unit-test:redis-server-clock";
let redisMock;
let initialTime;

// ioredis-mock 8 combines rounded epoch seconds with unrelated hrtime
// microseconds for TIME. Substitute only TIME in the mock's Lua fixture.
// Integration tests execute the production script unchanged on real Redis.
function withFixtureClock(lua) {
  return lua.replace(
    /redis\.call\(\s*["']TIME["']\s*\)/gi,
    `{math.floor(tonumber(redis.call('GET', '${CLOCK_KEY}')) / 1000), ` +
      `(tonumber(redis.call('GET', '${CLOCK_KEY}')) % 1000) * 1000}`,
  );
}

function makeMock() {
  const mock = new RedisMock();
  const evaluate = mock.eval.bind(mock);
  const defineCommand = mock.defineCommand.bind(mock);
  mock.eval = (lua, ...args) => evaluate(withFixtureClock(lua), ...args);
  mock.defineCommand = (name, options) =>
    defineCommand(name, { ...options, lua: withFixtureClock(options.lua) });
  return mock;
}

async function setServerTime(milliseconds) {
  await redisMock.set(CLOCK_KEY, String(milliseconds));
}

function unavailableClient(status = "reconnecting") {
  return {
    status,
    eval: jest.fn().mockRejectedValue(new Error("Redis unavailable")),
    quit: jest.fn().mockResolvedValue("OK"),
    disconnect: jest.fn(),
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  Object.assign(env, originalEnv, {
    RATE_LIMIT_ENABLED: true,
    RATE_LIMIT_FAIL_OPEN: true,
    RATE_LIMIT_WINDOW_SECONDS: 60,
    RATE_LIMIT_GENERAL_MAX_REQUESTS: 3,
    RATE_LIMIT_AUTH_MAX_REQUESTS: 3,
    RATE_LIMIT_WRITE_MAX_REQUESTS: 3,
    RATE_LIMIT_EXPENSIVE_MAX_REQUESTS: 3,
    REDIS_COMMAND_TIMEOUT_MS: 50,
  });
  redisMock = makeMock();
  await redisMock.flushdb(); // In-process mock only; never a shared server.
  initialTime = Date.now();
  await setServerTime(initialTime);
  _setRedisClientForTesting(redisMock, true);
  prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
  productService.listProducts.mockResolvedValue({ items: [], pagination: {} });
  productService.listCategories.mockResolvedValue([]);
  productService.getProductBySlug.mockImplementation(async (slug) => ({
    slug,
  }));
  oauthService.createState.mockResolvedValue("https://example.com/oauth");
  oauthService.pruneExpiredStates.mockResolvedValue(undefined);
  oauthService.handleCallback.mockRejectedValue(
    new Error("Invalid test state"),
  );
});

afterEach(async () => {
  await closeRedis();
  if (redisMock.status !== "end") redisMock.disconnect();
  Object.assign(env, originalEnv);
  jest.restoreAllMocks();
});

describe("Redis sliding-window algorithm", () => {
  test("allows exactly the quota, keeps unique simultaneous members, and rejects overflow", async () => {
    const key = "unit-test:quota";
    for (let i = 0; i < 3; i++) {
      expect(await checkSlidingWindow(key, 3, 60000)).toMatchObject({
        allowed: true,
        limit: 3,
        remaining: 2 - i,
        retryAfter: 0,
      });
    }
    expect(await redisMock.zcard(key)).toBe(3);
    expect(await checkSlidingWindow(key, 3, 60000)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfter: 60,
    });
    expect(await redisMock.zcard(key)).toBe(3);
  });

  test("expires only the oldest request at the exact sliding boundary", async () => {
    const key = "unit-test:sliding";
    await checkSlidingWindow(key, 2, 1000);
    await setServerTime(initialTime + 400);
    await checkSlidingWindow(key, 2, 1000);
    await setServerTime(initialTime + 999);
    expect((await checkSlidingWindow(key, 2, 1000)).allowed).toBe(false);
    await setServerTime(initialTime + 1000);
    expect(await checkSlidingWindow(key, 2, 1000)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(await redisMock.zcard(key)).toBe(2);
    await setServerTime(initialTime + 1400);
    expect((await checkSlidingWindow(key, 2, 1000)).allowed).toBe(true);
  });

  test("reports the same next available slot before and after quota exhaustion", async () => {
    const key = "unit-test:reset";
    const first = await checkSlidingWindow(key, 2, 60000);
    await setServerTime(initialTime + 10000);
    const lastAllowed = await checkSlidingWindow(key, 2, 60000);
    const blocked = await checkSlidingWindow(key, 2, 60000);
    expect(first.resetTime).toBe(Math.ceil((initialTime + 60000) / 1000));
    expect(lastAllowed.resetTime).toBe(first.resetTime);
    expect(blocked.resetTime).toBe(first.resetTime);
    expect(blocked.retryAfter).toBe(50);
  });

  test("gives each active bucket a bounded expiry", async () => {
    await checkSlidingWindow("unit-test:ttl", 2, 60000);
    const ttl = await redisMock.pttl("unit-test:ttl");
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(62000);
  });

  test("serializes concurrent evaluations atomically", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        checkSlidingWindow("unit-test:concurrent", 5, 60000),
      ),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    expect(results.filter((result) => !result.allowed)).toHaveLength(15);
  });

  test("maintains independent buckets for different clients", async () => {
    await checkSlidingWindow("unit-test:user:a", 1, 60000);
    expect(
      (await checkSlidingWindow("unit-test:user:a", 1, 60000)).allowed,
    ).toBe(false);
    expect(
      (await checkSlidingWindow("unit-test:user:b", 1, 60000)).allowed,
    ).toBe(true);
  });

  test.each(["connecting", "reconnecting", "end"])(
    "applies per-policy outage behavior while Redis is %s",
    async (status) => {
      const broken = unavailableClient(status);
      _setRedisClientForTesting(broken, false);
      expect(
        await checkSlidingWindow("unit-test:open", 3, 60000, {
          failOpen: true,
        }),
      ).toMatchObject({ allowed: true, failedOpen: true });
      expect(
        await checkSlidingWindow("unit-test:closed", 3, 60000, {
          failOpen: false,
        }),
      ).toMatchObject({ allowed: false, failedClosed: true });
      expect(broken.eval).not.toHaveBeenCalled();
    },
  );

  test("bounds a stalled ready connection and accepts traffic again after recovery", async () => {
    const stalled = unavailableClient("ready");
    const neverCompletes = jest.fn(() => new Promise(() => {}));
    stalled.eval = neverCompletes;
    stalled.defineCommand = (name) => {
      stalled[name] = neverCompletes;
    };
    _setRedisClientForTesting(stalled, true);
    const start = Date.now();
    expect(
      await checkSlidingWindow("unit-test:stall", 3, 60000, {
        failOpen: false,
      }),
    ).toMatchObject({ allowed: false, failedClosed: true });
    expect(Date.now() - start).toBeLessThan(1000);
    _setRedisClientForTesting(redisMock, true);
    expect(
      (await checkSlidingWindow("unit-test:stall", 3, 60000)).allowed,
    ).toBe(true);
  });
});

describe("Rate limiting on the actual application routes", () => {
  test("emits quota headers and a consistent 429 response", async () => {
    const first = await request(app).get("/api/products");
    expect(first.status).toBe(200);
    expect(first.headers["x-ratelimit-limit"]).toBe("3");
    expect(first.headers["x-ratelimit-remaining"]).toBe("2");
    expect(Number(first.headers["x-ratelimit-reset"])).toBeGreaterThan(0);
    await request(app).get("/api/products");
    await request(app).get("/api/products");
    const blocked = await request(app).get("/api/products");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ success: false, retryAfter: 60 });
    expect(blocked.headers["retry-after"]).toBe("60");
    expect(productService.listProducts).toHaveBeenCalledTimes(3);
  });

  test("login casing, trailing slashes, and query strings share the strict quota", async () => {
    for (const path of [
      "/api/auth/login",
      "/API/AUTH/LOGIN",
      "/Api/Auth/Login/?attempt=3",
    ]) {
      const response = await request(app).post(path).send({});
      expect(response.status).toBe(400);
      expect(response.headers["x-ratelimit-limit"]).toBe("3");
    }
    expect((await request(app).post("/api/auth/LoGiN").send({})).status).toBe(
      429,
    );
  });

  test("slugs, encoded parameter values, and numbers share their registered route quota", async () => {
    for (const path of [
      "/api/products/leather-bag",
      "/api/products/%62lue-bag",
      "/api/products/1234",
    ]) {
      expect((await request(app).get(path)).status).toBe(200);
    }
    expect(
      (await request(app).get("/api/products/another-product")).status,
    ).toBe(429);
    expect((await request(app).get("/api/products/categories")).status).toBe(
      200,
    );
  });

  test("HEAD and GET consume the same read quota", async () => {
    expect((await request(app).head("/api/products")).status).toBe(200);
    expect((await request(app).get("/api/products?page=2")).status).toBe(200);
    expect((await request(app).head("/API/PRODUCTS/")).status).toBe(200);
    expect((await request(app).get("/api/products")).status).toBe(429);
  });

  test("profile aliases consume a shared quota before authentication", async () => {
    for (const path of [
      "/api/users",
      "/api/account/me/profile",
      "/api/users/me/profile",
    ]) {
      expect((await request(app).get(path)).status).toBe(401);
    }
    expect((await request(app).get("/api/account")).status).toBe(429);
  });

  test("order history and order listing aliases share their quota", async () => {
    for (const path of ["/api/orders", "/api/orders/history", "/API/ORDERS/"]) {
      expect((await request(app).get(path)).status).toBe(401);
    }
    expect((await request(app).get("/api/orders/history")).status).toBe(429);
  });

  test.each([
    ["/api/upload", "/api/upload/image"],
    ["/api/users/avatar", "/api/account/me/avatar"],
  ])("upload aliases %s and %s share quota", async (first, alias) => {
    for (let i = 0; i < 3; i++)
      expect((await request(app).post(first)).status).toBe(401);
    expect((await request(app).post(alias)).status).toBe(429);
  });

  test("OAuth provider routes and the public Google callback share their preserved budget", async () => {
    env.RATE_LIMIT_GENERAL_MAX_REQUESTS = 100;
    const first = await request(app).get("/api/auth/oauth/google");
    expect(first.status).toBe(302);
    expect(first.headers["x-ratelimit-limit"]).toBe("100");
    const limit = 30;
    for (let i = 1; i < limit; i++) {
      const path =
        i % 2 ? "/api/auth/oauth/facebook" : "/api/auth/oauth/google/callback";
      expect([302, 303]).toContain((await request(app).get(path)).status);
    }
    expect((await request(app).get("/auth/google/callback")).status).toBe(429);
  });

  test("health repeatedly bypasses Redis accounting", async () => {
    for (let i = 0; i < 5; i++) {
      const health = await request(app).get("/api/health");
      expect(health.status).toBe(200);
      expect(health.headers["x-ratelimit-limit"]).toBeUndefined();
    }
    expect(
      (await redisMock.keys("*")).filter((key) => key !== CLOCK_KEY),
    ).toEqual([]);
  });

  test("unmatched paths share one bounded bucket instead of multiplying Redis keys", async () => {
    for (let i = 0; i < 10; i++) {
      const path = i === 0 ? "/docs/" : `/does-not-exist-${i}`;
      expect((await request(app).get(path)).status).toBe(i < 3 ? 404 : 429);
    }
    expect(
      (await redisMock.keys("*")).filter((key) => key !== CLOCK_KEY),
    ).toHaveLength(1);
  });

  test("signed users have independent public-read quotas without a database query", async () => {
    const tokenA = signAccessToken({ id: "user-a", role: "CUSTOMER" });
    const tokenB = signAccessToken({ id: "user-b", role: "CUSTOMER" });
    for (let i = 0; i < 3; i++) {
      expect(
        (
          await request(app)
            .get("/api/products")
            .auth(tokenA, { type: "bearer" })
        ).status,
      ).toBe(200);
    }
    expect(
      (await request(app).get("/api/products").auth(tokenA, { type: "bearer" }))
        .status,
    ).toBe(429);
    expect(
      (await request(app).get("/api/products").auth(tokenB, { type: "bearer" }))
        .status,
    ).toBe(200);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("admin tokens do not bypass rate limiting", async () => {
    const token = signAccessToken({ id: "admin-user", role: "ADMIN" });
    for (let i = 0; i < 3; i++) {
      expect(
        (
          await request(app)
            .get("/api/products")
            .auth(token, { type: "bearer" })
        ).status,
      ).toBe(200);
    }
    expect(
      (await request(app).get("/api/products").auth(token, { type: "bearer" }))
        .status,
    ).toBe(429);
  });

  test("invalid bearer tokens fall back to the guest identity", () => {
    const resolved = resolveClientIdentifier({
      headers: { authorization: "Bearer invalid" },
      ip: "192.0.2.20",
    });
    expect(resolved.type).toBe("ip");
    expect(resolved.id).toContain("192.0.2.20");
  });

  test.each([
    ["post", "/api/auth/login"],
    ["post", "/api/payments/razorpay/create-order"],
    ["post", "/api/upload"],
    ["post", "/api/orders"],
    ["post", "/api/auth/change-password"],
  ])(
    "Redis outage returns 503 before sensitive %s %s",
    async (method, path) => {
      _setRedisClientForTesting(unavailableClient(), false);
      const result = await request(app)[method](path).send({});
      expect(result.status).toBe(503);
      expect(result.body.success).toBe(false);
      expect(Number(result.headers["retry-after"])).toBeGreaterThan(0);
    },
  );

  test("general reads obey the configured fail-open setting", async () => {
    _setRedisClientForTesting(unavailableClient(), false);
    expect((await request(app).get("/api/products")).status).toBe(200);
    env.RATE_LIMIT_FAIL_OPEN = false;
    expect((await request(app).get("/api/products")).status).toBe(503);
  });
});
