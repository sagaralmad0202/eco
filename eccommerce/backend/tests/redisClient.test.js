const { EventEmitter } = require("events");
jest.mock("ioredis", () => jest.fn());
const Redis = require("ioredis");
const env = require("../src/config/env");
const redis = require("../src/lib/redis");
const { checkSlidingWindow } = require("../src/lib/rateLimiter/limiter");

const original = { ...env };
let client;
beforeEach(() => {
  Object.assign(env, original, {
    REDIS_COMMAND_TIMEOUT_MS: 25,
    REDIS_CONNECT_TIMEOUT_MS: 30,
    RATE_LIMIT_ENABLED: true,
  });
  process.env.USE_REDIS_MOCK = "false";
  client = new EventEmitter();
  client.status = "ready";
  client.connect = jest.fn().mockResolvedValue();
  client.disconnect = jest.fn();
  client.quit = jest.fn().mockResolvedValue("OK");
  client.eval = jest.fn().mockResolvedValue([1, 4, 0, 2000000000]);
  Redis.mockReset().mockImplementation(() => client);
  redis._setRedisClientForTesting(null);
});
afterEach(async () => {
  await redis.closeRedis();
  Object.assign(env, original);
  process.env.USE_REDIS_MOCK = "true";
});

test("reuses one client with bounded commands and no queued/replayed admissions", async () => {
  expect(redis.getRedisClient()).toBe(redis.getRedisClient());
  expect(Redis).toHaveBeenCalledTimes(1);
  expect(Redis.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      connectTimeout: 30,
      commandTimeout: 25,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      autoResendUnfulfilledCommands: false,
    }),
  );
  expect(await redis.initializeRedis()).toBe(true);
});

test("stalled ready command has a deadline, drops socket, then recovers", async () => {
  client.eval.mockImplementationOnce(() => new Promise(() => {}));
  const started = Date.now();
  const failed = await checkSlidingWindow("test:deadline", 5, 60000, {
    failOpen: false,
  });
  expect(failed.failedClosed).toBe(true);
  expect(Date.now() - started).toBeLessThan(1000);
  expect(client.disconnect).toHaveBeenCalledTimes(1);
  expect(redis.isRedisReady()).toBe(false);
  client.emit("ready");
  expect(
    (await checkSlidingWindow("test:deadline", 5, 60000, { failOpen: false }))
      .allowed,
  ).toBe(true);
});

test.each(["wait", "connecting", "connect", "reconnecting", "end", "close"])(
  "status %s rejects without queueing a Redis command",
  async (status) => {
    client.status = status;
    expect(
      (await checkSlidingWindow("test:status", 5, 60000, { failOpen: false }))
        .failedClosed,
    ).toBe(true);
    expect(client.eval).not.toHaveBeenCalled();
  },
);

test("startup times out and removes its readiness listener", async () => {
  client.status = "connecting";
  const result = await redis.initializeRedis();
  expect(result).toBe(false);
  // Only the permanent readiness logger remains.
  expect(client.listenerCount("ready")).toBe(1);
  client.status = "ready";
  client.emit("ready");
  expect(redis.isRedisReady()).toBe(true);
});

test("shutdown is bounded even when QUIT never responds", async () => {
  redis.getRedisClient();
  client.quit.mockImplementation(() => new Promise(() => {}));
  const started = Date.now();
  await redis.closeRedis();
  expect(Date.now() - started).toBeLessThan(1000);
  expect(client.disconnect).toHaveBeenCalled();
  expect(redis.isRedisReady()).toBe(false);
});

test("disabled configuration creates no client at startup", async () => {
  env.RATE_LIMIT_ENABLED = false;
  expect(await redis.initializeRedis()).toBe(true);
  expect(Redis).not.toHaveBeenCalled();
});

test("missing URL is explicit and never defaults to localhost", async () => {
  env.REDIS_URL = undefined;
  expect(await redis.initializeRedis()).toBe(false);
  expect(Redis).not.toHaveBeenCalled();
});

test("real ioredis reconnects after a stalled socket instead of entering terminal end", async () => {
  const net = require("net");
  const RealRedis = jest.requireActual("ioredis");
  const sockets = new Set();
  let connections = 0;
  const server = net.createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    // The first connection stalls. Subsequent connections model recovery.
    socket.on("data", () => {
      if (connections > 1)
        socket.write("*4\r\n:1\r\n:4\r\n:0\r\n:2000000000\r\n");
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const actual = new RealRedis({
    host: "127.0.0.1",
    port: server.address().port,
    lazyConnect: true,
    enableReadyCheck: false,
    disableClientInfo: true,
    enableOfflineQueue: false,
    autoResendUnfulfilledCommands: false,
    maxRetriesPerRequest: 0,
    commandTimeout: 25,
    retryStrategy: () => 25,
  });
  actual.on("error", () => {});
  try {
    await actual.connect();
    redis._setRedisClientForTesting(actual);
    const recovered = new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Redis did not reconnect")),
        1500,
      );
      const onRecovered = () => {
        // connect() can resolve before the initial ready event is delivered.
        if (connections < 2) return;
        actual.removeListener("ready", onRecovered);
        // An injected client has no application-owned lifecycle listeners.
        redis._setRedisClientForTesting(actual);
        clearTimeout(timer);
        resolve();
      };
      actual.on("ready", onRecovered);
    });
    expect(
      (await checkSlidingWindow("test:network", 5, 60000, { failOpen: false }))
        .failedClosed,
    ).toBe(true);
    await recovered;
    expect(connections).toBeGreaterThanOrEqual(2);
    expect(actual.status).toBe("ready");
    expect(
      (await checkSlidingWindow("test:network", 5, 60000, { failOpen: false }))
        .allowed,
    ).toBe(true);
  } finally {
    actual.disconnect();
    redis._setRedisClientForTesting(null);
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  }
});
