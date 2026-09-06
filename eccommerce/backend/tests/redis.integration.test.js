jest.mock("../src/lib/logger", () => require("pino")({ level: "silent" }));

const crypto = require("crypto");
const net = require("net");
const tls = require("tls");
const path = require("path");
const { spawn } = require("child_process");
const Redis = require("ioredis");
const env = require("../src/config/env");
const {
  _setRedisClientForTesting,
  closeRedis,
  getRedisClient,
  initializeRedis,
} = require("../src/lib/redis");
const { checkSlidingWindow } = require("../src/lib/rateLimiter/limiter");
const {
  loginThrottle,
  completeLoginAttempt,
} = require("../src/middleware/loginThrottle");

// Opt in to an explicitly provided test server. Never use REDIS_URL as a
// fallback: that could accidentally connect the suite to a production store.
const testUrl = process.env.TEST_REDIS_URL;
const integration = testUrl ? describe : describe.skip;
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connect(url) {
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    autoResendUnfulfilledCommands: false,
    connectTimeout: 2000,
    commandTimeout: 2000,
  });
  client.on("error", () => {});
  await client.connect();
  return client;
}

// Relays a real Redis connection and can discard responses to simulate an
// established socket that stops replying. It only affects this test client.
async function createResponseProxy(url) {
  const destination = new URL(url);
  const sockets = new Set();
  const state = { discardResponses: false };
  const server = net.createServer((downstream) => {
    const options = {
      host: destination.hostname,
      port: Number(destination.port || 6379),
    };
    const upstream =
      destination.protocol === "rediss:"
        ? tls.connect({ ...options, servername: destination.hostname })
        : net.connect(options);
    sockets.add(downstream);
    sockets.add(upstream);
    downstream.on("data", (chunk) => upstream.write(chunk));
    upstream.on("data", (chunk) => {
      if (!state.discardResponses) downstream.write(chunk);
    });
    const close = () => {
      downstream.destroy();
      upstream.destroy();
      sockets.delete(downstream);
      sockets.delete(upstream);
    };
    downstream.on("error", close);
    upstream.on("error", close);
    downstream.on("close", close);
    upstream.on("close", close);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const proxyUrl = new URL(url);
  proxyUrl.protocol = "redis:";
  proxyUrl.hostname = "127.0.0.1";
  proxyUrl.port = String(server.address().port);
  return {
    state,
    url: proxyUrl.toString(),
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

function runWorker(key) {
  const source = `
    require('./tests/setup');
    process.env.USE_REDIS_MOCK = 'false';
    process.env.LOG_LEVEL = 'fatal';
    const env = require('./src/config/env');
    env.REDIS_URL = process.env.TEST_REDIS_URL;
    env.RATE_LIMIT_ENABLED = true;
    env.REDIS_CONNECT_TIMEOUT_MS = 2000;
    env.REDIS_COMMAND_TIMEOUT_MS = 2000;
    const { initializeRedis, closeRedis } = require('./src/lib/redis');
    const { checkSlidingWindow } = require('./src/lib/rateLimiter/limiter');
    (async () => {
      if (!await initializeRedis()) throw new Error('Test Redis did not become ready');
      const results = await Promise.all(Array.from({length: 20}, () =>
        checkSlidingWindow(process.env.TEST_REDIS_KEY, 7, 60000, {failOpen: false})));
      if (results.some(result => result.failedClosed)) throw new Error('Redis command failed');
      process.stdout.write(JSON.stringify({ allowed: results.filter(result => result.allowed).length }));
      await closeRedis();
    })().catch(async () => { await closeRedis(); process.exitCode = 1; });
  `;
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["-e", source], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, TEST_REDIS_URL: testUrl, TEST_REDIS_KEY: key },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    const timer = setTimeout(() => child.kill(), 15000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    // Avoid echoing a connection URL or credentials from a child error.
    child.stderr.resume();
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0)
        return reject(new Error(`Redis test worker exited with code ${code}`));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Invalid Redis worker result"));
      }
    });
  });
}

integration("Real Redis integration (TEST_REDIS_URL)", () => {
  const prefix = `codex-rate-limit-test:${crypto.randomUUID()}`;
  const ownKeys = new Set();
  const clients = [];
  const originalEnv = { ...env };
  const originalMockSetting = process.env.USE_REDIS_MOCK;
  let cleanupClient;
  let client;
  let caseEnv;

  function key(name) {
    const value = `${prefix}:${name}`;
    ownKeys.add(value);
    return value;
  }

  async function acquireAccount(email) {
    const req = { body: { email }, id: "real-redis-test" };
    const res = { statusCode: 200, setHeader: jest.fn(), json: jest.fn() };
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    const next = jest.fn();
    await loginThrottle(req, res, next);
    if (req.loginAttempt) ownKeys.add(req.loginAttempt.key);
    return { req, res, next };
  }

  beforeAll(async () => {
    process.env.USE_REDIS_MOCK = "false";
    Object.assign(env, {
      REDIS_URL: testUrl,
      RATE_LIMIT_ENABLED: true,
      REDIS_COMMAND_TIMEOUT_MS: 2000,
      REDIS_CONNECT_TIMEOUT_MS: 2000,
      RATE_LIMIT_NAMESPACE: prefix,
      LOGIN_MAX_ATTEMPTS: 3,
      LOGIN_WINDOW_MS: 60000,
      LOGIN_BLOCK_DURATION_MS: 30000,
      LOGIN_ATTEMPT_LEASE_MS: 30000,
    });
    cleanupClient = await connect(testUrl);
  });

  beforeEach(async () => {
    caseEnv = { ...env };
    env.REDIS_URL = testUrl;
    env.REDIS_COMMAND_TIMEOUT_MS = 2000;
    env.REDIS_CONNECT_TIMEOUT_MS = 2000;
    Object.assign(env, {
      LOGIN_MAX_ATTEMPTS: 3,
      LOGIN_WINDOW_MS: 60000,
      LOGIN_BLOCK_DURATION_MS: 30000,
      LOGIN_ATTEMPT_LEASE_MS: 30000,
    });
    client = await connect(testUrl);
    clients.push(client);
    _setRedisClientForTesting(client, true);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await closeRedis();
    for (const connection of clients.splice(0)) connection.disconnect();
    _setRedisClientForTesting(null, true);
    if (cleanupClient && ownKeys.size) await cleanupClient.del(...ownKeys);
    ownKeys.clear();
    Object.assign(env, caseEnv);
  });

  afterAll(async () => {
    cleanupClient?.disconnect();
    Object.assign(env, originalEnv);
    if (originalMockSetting === undefined) delete process.env.USE_REDIS_MOCK;
    else process.env.USE_REDIS_MOCK = originalMockSetting;
  });

  test("two independent application processes admit exactly one shared quota", async () => {
    const shared = key("processes");
    const results = await Promise.all([runWorker(shared), runWorker(shared)]);
    expect(results.reduce((sum, result) => sum + result.allowed, 0)).toBe(7);
    expect(await cleanupClient.zcard(shared)).toBe(7);
  }, 20000);

  test("simultaneous clients share one atomic counter", async () => {
    const other = await connect(testUrl);
    clients.push(other);
    const shared = key("concurrent-clients");
    const results = await Promise.all(
      Array.from({ length: 40 }, (_, index) => {
        _setRedisClientForTesting(index % 2 ? client : other, true);
        return checkSlidingWindow(shared, 5, 60000, { failOpen: false });
      }),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    expect(results.some((result) => result.failedClosed)).toBe(false);
    expect(await cleanupClient.zcard(shared)).toBe(5);
  });

  test("recreating the Redis connection does not reset an exhausted quota", async () => {
    const shared = key("reconnect");
    expect(
      (await checkSlidingWindow(shared, 1, 60000, { failOpen: false })).allowed,
    ).toBe(true);
    await closeRedis();
    _setRedisClientForTesting(null, true);
    expect(await initializeRedis()).toBe(true);
    expect(getRedisClient()).not.toBe(client);
    expect(
      (await checkSlidingWindow(shared, 1, 60000, { failOpen: false })).allowed,
    ).toBe(false);
  });

  test("account failure cooldown survives application connection recreation", async () => {
    const email = `${crypto.randomUUID()}@example.test`;
    for (let i = 0; i < 3; i++) {
      const attempt = await acquireAccount(email);
      expect(attempt.next).toHaveBeenCalledTimes(1);
      await completeLoginAttempt(attempt.req, "failure");
    }
    await closeRedis();
    _setRedisClientForTesting(null, true);
    expect(await initializeRedis()).toBe(true);
    const blocked = await acquireAccount(email);
    expect(blocked.next).not.toHaveBeenCalled();
    expect(blocked.res.statusCode).toBe(429);
  });

  test("simultaneous account attempts across clients reserve only the available capacity", async () => {
    const other = await connect(testUrl);
    clients.push(other);
    const email = `${crypto.randomUUID()}@example.test`;
    const attempts = await Promise.all(
      Array.from({ length: 12 }, (_, index) => {
        _setRedisClientForTesting(index % 2 ? client : other, true);
        return acquireAccount(email);
      }),
    );
    expect(
      attempts.filter((attempt) => attempt.next.mock.calls.length),
    ).toHaveLength(3);
    expect(
      attempts.filter((attempt) => attempt.res.statusCode === 429),
    ).toHaveLength(9);
  });

  test("server time controls the quota even when the application clock jumps", async () => {
    const shared = key("server-time");
    await checkSlidingWindow(shared, 1, 60000, { failOpen: false });
    const realNow = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(realNow + 86400000);
    expect(
      await checkSlidingWindow(shared, 1, 60000, { failOpen: false }),
    ).toMatchObject({ allowed: false, remaining: 0 });
  });

  test("an expired account reservation fails closed and preserves its cooldown", async () => {
    Object.assign(env, {
      LOGIN_MAX_ATTEMPTS: 1,
      LOGIN_WINDOW_MS: 10000,
      LOGIN_BLOCK_DURATION_MS: 1000,
      LOGIN_ATTEMPT_LEASE_MS: 100,
    });
    const email = `${crypto.randomUUID()}@example.test`;
    const attempt = await acquireAccount(email);
    expect(attempt.next).toHaveBeenCalledTimes(1);
    const accountKey = attempt.req.loginAttempt.key;
    await delay(200);
    await expect(
      completeLoginAttempt(attempt.req, "failure"),
    ).rejects.toMatchObject({ statusCode: 503 });
    const blocked = await acquireAccount(email);
    expect(blocked.next).not.toHaveBeenCalled();
    expect(blocked.res.statusCode).toBe(429);
    expect(await cleanupClient.exists(accountKey)).toBe(1);
    expect(await cleanupClient.pttl(accountKey)).toBeGreaterThan(0);
  });

  test("evicts old scores but retains recent admissions using real Redis TIME", async () => {
    const shared = key("partial-expiry");
    const [seconds, microseconds] = await cleanupClient.time();
    const now =
      Number(seconds) * 1000 + Math.floor(Number(microseconds) / 1000);
    await cleanupClient.zadd(shared, now - 5000, "expired", now, "recent");
    expect(
      await checkSlidingWindow(shared, 2, 3000, { failOpen: false }),
    ).toMatchObject({ allowed: true, remaining: 0 });
    expect(await cleanupClient.zscore(shared, "expired")).toBeNull();
    expect(await cleanupClient.zscore(shared, "recent")).not.toBeNull();
  });

  test("expires inactive keys and allows a fresh window", async () => {
    const shared = key("ttl");
    await checkSlidingWindow(shared, 1, 300, { failOpen: false });
    const ttl = await cleanupClient.pttl(shared);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(300);
    await delay(400);
    expect(await cleanupClient.exists(shared)).toBe(0);
    expect(
      (await checkSlidingWindow(shared, 1, 300, { failOpen: false })).allowed,
    ).toBe(true);
  });

  test("reloads Lua after a real NOSCRIPT response without flushing shared scripts", async () => {
    const shared = key("noscript");
    await checkSlidingWindow(shared, 3, 60000, { failOpen: false });
    const originalSend = client.sendCommand.bind(client);
    let uncachedShaSent = false;
    // Simulate just this client's cached SHA becoming absent. Redis itself
    // returns NOSCRIPT, and ioredis must recover via EVAL of the real script.
    jest.spyOn(client, "sendCommand").mockImplementation((command, ...args) => {
      if (!uncachedShaSent && command.name === "evalsha") {
        uncachedShaSent = true;
        command.args[0] = crypto.randomBytes(20).toString("hex");
      }
      return originalSend(command, ...args);
    });
    expect(
      await checkSlidingWindow(shared, 3, 60000, { failOpen: false }),
    ).toMatchObject({ allowed: true, remaining: 1 });
    expect(uncachedShaSent).toBe(true);
    expect(await cleanupClient.zcard(shared)).toBe(2);
  });

  test("bounds an established connection outage and recovers without resetting Redis state", async () => {
    const proxy = await createResponseProxy(testUrl);
    const shared = key("stalled-socket");
    try {
      await closeRedis();
      _setRedisClientForTesting(null, true);
      env.REDIS_URL = proxy.url;
      env.REDIS_COMMAND_TIMEOUT_MS = 100;
      expect(await initializeRedis()).toBe(true);
      expect(
        (await checkSlidingWindow(shared, 3, 60000, { failOpen: false }))
          .allowed,
      ).toBe(true);
      proxy.state.discardResponses = true;
      const started = Date.now();
      expect(
        await checkSlidingWindow(shared, 3, 60000, { failOpen: false }),
      ).toMatchObject({ allowed: false, failedClosed: true });
      expect(Date.now() - started).toBeLessThan(1000);
      proxy.state.discardResponses = false;
      expect(await initializeRedis()).toBe(true);
      const recovered = await checkSlidingWindow(shared, 3, 60000, {
        failOpen: false,
      });
      expect(recovered).toMatchObject({ allowed: true });
      // The timed-out admission reached Redis. Reconnecting must not replay it
      // or reset the first admission: exactly three entries should remain.
      expect(await cleanupClient.zcard(shared)).toBe(3);
      expect(
        (await checkSlidingWindow(shared, 3, 60000, { failOpen: false }))
          .allowed,
      ).toBe(false);
    } finally {
      await closeRedis();
      await proxy.close();
    }
  });
});
