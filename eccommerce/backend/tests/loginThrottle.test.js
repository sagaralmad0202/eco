const RedisMock = require("ioredis-mock");
const env = require("../src/config/env");
const { _setRedisClientForTesting, closeRedis } = require("../src/lib/redis");
const {
  loginThrottle,
  completeLoginAttempt,
} = require("../src/middleware/loginThrottle");

function response() {
  const res = { statusCode: 200, headers: {}, body: null };
  res.setHeader = (key, value) => {
    res.headers[key] = value;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

async function acquire(email = "test@example.com") {
  const req = { body: { email }, id: "test-request" };
  const res = response();
  const next = jest.fn();
  await loginThrottle(req, res, next);
  return { req, res, next };
}

// The Lua state machine runs in ioredis-mock. Substitute only Redis's TIME
// result so boundary tests advance the server clock without long real waits.
function controlledRedis(clock) {
  const redis = new RedisMock();
  redis.defineCommand = (name, { lua, numberOfKeys }) => {
    redis[name] = (...args) =>
      redis.eval(
        lua.replace(
          "local serverTime = redis.call('TIME')",
          `local serverTime = { '${Math.floor(clock.now / 1000)}', '${(clock.now % 1000) * 1000}' }`,
        ),
        numberOfKeys,
        ...args,
      );
  };
  return redis;
}

describe("distributed account login throttle", () => {
  let redis;
  let clock;
  let savedEnv;

  beforeEach(async () => {
    savedEnv = { ...env };
    Object.assign(env, {
      RATE_LIMIT_ENABLED: true,
      RATE_LIMIT_FAIL_OPEN: true,
      RATE_LIMIT_NAMESPACE: "ecommerce-test",
      LOGIN_MAX_ATTEMPTS: 3,
      LOGIN_WINDOW_MS: 60000,
      LOGIN_BLOCK_DURATION_MS: 30000,
      LOGIN_ATTEMPT_LEASE_MS: 30000,
    });
    clock = { now: Date.now() };
    redis = controlledRedis(clock);
    await redis.flushall();
    _setRedisClientForTesting(redis, true);
  });

  afterEach(async () => {
    await closeRedis();
    Object.assign(env, savedEnv);
  });

  test("reserves before authentication and rejects concurrent excess requests", async () => {
    const attempts = await Promise.all(
      Array.from({ length: 10 }, () => acquire()),
    );
    expect(
      attempts.filter(({ next }) => next.mock.calls.length === 1),
    ).toHaveLength(3);
    const blocked = attempts.filter(({ res }) => res.statusCode === 429);
    expect(blocked).toHaveLength(7);
    expect(blocked[0].res.headers["Retry-After"]).toBe(60);
    expect(blocked[0].res.headers["X-RateLimit-Reset"]).toBe(
      Math.ceil((clock.now + 60000) / 1000),
    );
    await Promise.all(
      attempts
        .filter(({ req }) => req.loginAttempt)
        .map(({ req }) => completeLoginAttempt(req, "failure")),
    );
    expect((await acquire()).res.statusCode).toBe(429);
  });

  test("shares case-normalized account state and stores no raw email", async () => {
    const first = await acquire("  Test@Example.COM  ");
    const key = first.req.loginAttempt.key;
    expect(key).toMatch(/^ecommerce-test:rl:v1:login-account:[a-f0-9]{64}$/);
    await completeLoginAttempt(first.req, "failure");
    for (let index = 0; index < 2; index += 1) {
      const attempt = await acquire();
      await completeLoginAttempt(attempt.req, "failure");
    }
    expect((await acquire("TEST@example.com")).res.statusCode).toBe(429);
    expect((await acquire("different@example.com")).next).toHaveBeenCalledTimes(
      1,
    );
    expect(JSON.stringify(await redis.hgetall(key))).not.toContain(
      "example.com",
    );
  });

  test("threshold one blocks after the first failure", async () => {
    env.LOGIN_MAX_ATTEMPTS = 1;
    const attempt = await acquire();
    await completeLoginAttempt(attempt.req, "failure");
    expect((await acquire()).res.statusCode).toBe(429);
  });

  test("denied requests do not extend cooldown and its boundary admits again", async () => {
    env.LOGIN_MAX_ATTEMPTS = 1;
    const attempt = await acquire();
    const key = attempt.req.loginAttempt.key;
    await completeLoginAttempt(attempt.req, "failure");
    const blockedUntil = await redis.hget(key, "blockedUntil");
    clock.now += 10000;
    expect((await acquire()).res.headers["Retry-After"]).toBe(20);
    expect(await redis.hget(key, "blockedUntil")).toBe(blockedUntil);
    clock.now += 20000;
    expect((await acquire()).next).toHaveBeenCalledTimes(1);
  });

  test("expires the failure window while preserving live reservations", async () => {
    const failed = await acquire();
    await completeLoginAttempt(failed.req, "failure");
    clock.now += 59000;
    const pending = await acquire();
    clock.now += 1000;
    const newAttempt = await acquire();
    const last = await acquire();
    expect(newAttempt.next).toHaveBeenCalledTimes(1);
    expect(last.next).toHaveBeenCalledTimes(1);
    expect((await acquire()).res.statusCode).toBe(429);
    await completeLoginAttempt(pending.req, "release");
    expect((await acquire()).next).toHaveBeenCalledTimes(1);
  });

  test("slow failed logins retain a strike and cooldown after their lease", async () => {
    env.LOGIN_MAX_ATTEMPTS = 1;
    const startedAt = clock.now;
    const abandoned = await acquire();
    const key = abandoned.req.loginAttempt.key;
    expect(await redis.pttl(key)).toBeGreaterThan(30000);
    clock.now += 31000;
    await expect(
      completeLoginAttempt(abandoned.req, "failure"),
    ).rejects.toMatchObject({ statusCode: 503, rateLimitUnavailable: true });
    expect(Number(await redis.hget(key, "blockedUntil"))).toBe(
      startedAt + 60000,
    );
    const blocked = await acquire();
    expect(blocked.res.statusCode).toBe(429);
    expect(blocked.res.headers["Retry-After"]).toBe(29);
    clock.now += 29000;
    const second = await acquire();
    expect(second.next).toHaveBeenCalledTimes(1);
    clock.now += 31000;
    await expect(
      completeLoginAttempt(second.req, "failure"),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(Number(await redis.hget(key, "blockedUntil"))).toBe(
      startedAt + 120000,
    );
    expect((await acquire()).res.statusCode).toBe(429);
  });

  test("expired success cannot create a session and overdue cleanup cannot restart an old cooldown", async () => {
    env.LOGIN_MAX_ATTEMPTS = 1;
    const lateSuccess = await acquire();
    clock.now += 31000;
    await expect(
      completeLoginAttempt(lateSuccess.req, "success"),
    ).rejects.toMatchObject({ statusCode: 503, rateLimitUnavailable: true });
    expect((await acquire()).res.statusCode).toBe(429);
    clock.now += 29000;
    const abandoned = await acquire();
    clock.now += 100000;
    const fresh = await acquire();
    expect(fresh.next).toHaveBeenCalledTimes(1);
    await expect(
      completeLoginAttempt(abandoned.req, "failure"),
    ).rejects.toMatchObject({ statusCode: 503 });
    await completeLoginAttempt(fresh.req, "success");
  });

  test("accounts for expired leases by expiry time rather than hash order", async () => {
    env.LOGIN_MAX_ATTEMPTS = 2;
    env.LOGIN_WINDOW_MS = 15000;
    const startedAt = clock.now;
    const first = await acquire();
    const key = first.req.loginAttempt.key;
    clock.now += 10000;
    env.LOGIN_ATTEMPT_LEASE_MS = 10000;
    await acquire();
    clock.now += 25000;
    const blocked = await acquire();
    expect(blocked.res.statusCode).toBe(429);
    expect(Number(await redis.hget(key, "blockedUntil"))).toBe(
      startedAt + 60000,
    );
    expect(blocked.res.headers["Retry-After"]).toBe(25);
  });

  test("timely concurrent successes retain live peers and pending capacity", async () => {
    const first = await acquire();
    const failure = await acquire();
    const second = await acquire();
    const key = first.req.loginAttempt.key;
    await completeLoginAttempt(first.req, "success");
    const fresh = await acquire();
    expect((await acquire()).res.statusCode).toBe(429);
    await completeLoginAttempt(failure.req, "failure");
    expect(Number(await redis.hget(key, "failures"))).toBe(1);
    await completeLoginAttempt(second.req, "success");
    expect(Number(await redis.hget(key, "failures"))).toBe(0);
    await completeLoginAttempt(fresh.req, "release");
    expect(await redis.exists(key)).toBe(0);
  });

  test("dead-generation completions reject without altering newer failures", async () => {
    const oldSuccess = await acquire();
    const oldFailure = await acquire();
    const key = oldSuccess.req.loginAttempt.key;
    clock.now += 100000;
    const fresh = await acquire();
    expect(fresh.req.loginAttempt.generation).not.toBe(
      oldSuccess.req.loginAttempt.generation,
    );
    await completeLoginAttempt(fresh.req, "failure");
    await expect(
      completeLoginAttempt(oldFailure.req, "failure"),
    ).rejects.toMatchObject({ statusCode: 503 });
    await expect(
      completeLoginAttempt(oldSuccess.req, "success"),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(Number(await redis.hget(key, "failures"))).toBe(1);
  });

  test("release creates no strike, completion is idempotent, and empty keys disappear", async () => {
    const attempt = await acquire();
    const key = attempt.req.loginAttempt.key;
    await completeLoginAttempt(attempt.req, "release");
    await completeLoginAttempt(attempt.req, "failure");
    expect(await redis.exists(key)).toBe(0);
    expect((await acquire()).next).toHaveBeenCalledTimes(1);
  });

  test("state has a bounded TTL and application clock skew does not change the budget", async () => {
    const attempt = await acquire();
    const key = attempt.req.loginAttempt.key;
    await completeLoginAttempt(attempt.req, "failure");
    expect(await redis.pttl(key)).toBeGreaterThan(0);
    expect(await redis.pttl(key)).toBeLessThanOrEqual(60000);
    const now = jest.spyOn(Date, "now").mockReturnValue(clock.now - 3600000);
    try {
      expect((await acquire()).next).toHaveBeenCalledTimes(1);
      expect((await acquire()).next).toHaveBeenCalledTimes(1);
      expect((await acquire()).res.statusCode).toBe(429);
    } finally {
      now.mockRestore();
    }
  });

  test("Redis failure closes admission even when general traffic can fail open", async () => {
    redis.defineCommand = () => {
      throw new Error("simulated Redis unavailable");
    };
    const attempt = await acquire();
    expect(attempt.next).not.toHaveBeenCalled();
    expect(attempt.res.statusCode).toBe(503);
    expect(attempt.res.headers["Retry-After"]).toBe(1);
  });

  test("a Redis failure during completion prevents a successful login response", async () => {
    const attempt = await acquire();
    redis.loginAttempts = () =>
      Promise.reject(new Error("simulated Redis unavailable"));
    await expect(
      completeLoginAttempt(attempt.req, "success"),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  test("explicit disable and missing email skip Redis", async () => {
    const defineCommand = jest.spyOn(redis, "defineCommand");
    env.RATE_LIMIT_ENABLED = false;
    const attempt = await acquire();
    expect(attempt.next).toHaveBeenCalledTimes(1);
    await completeLoginAttempt(attempt.req, "success");
    env.RATE_LIMIT_ENABLED = true;
    expect((await acquire("")).next).toHaveBeenCalledTimes(1);
    expect(defineCommand).not.toHaveBeenCalled();
  });
});
