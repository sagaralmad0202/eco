const Redis = require("ioredis");
const env = require("../config/env");
const logger = require("./logger");
const { recordEvent } = require("./rateLimiter/response");

let redisClient = null;
let commandsReady = false;

class RedisUnavailableError extends Error {
  constructor() {
    super("Rate limit service unavailable");
    this.name = "RedisUnavailableError";
  }
}

function deadline(action, milliseconds) {
  let timer;
  return Promise.race([
    Promise.resolve().then(action),
    new Promise((resolve, reject) => {
      timer = setTimeout(
        () => reject(new RedisUnavailableError()),
        milliseconds,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

function getRedisClient() {
  if (redisClient) return redisClient;
  if (env.NODE_ENV === "test" && process.env.USE_REDIS_MOCK === "true") {
    const RedisMock = require("ioredis-mock");
    redisClient = new RedisMock();
    redisClient.status = "ready";
    commandsReady = true;
    return redisClient;
  }
  if (!env.REDIS_URL) return null;
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
    commandTimeout: env.REDIS_COMMAND_TIMEOUT_MS,
    socketTimeout: env.REDIS_COMMAND_TIMEOUT_MS * 2,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    // Admission is non-idempotent: never replay a request after an uncertain write.
    autoResendUnfulfilledCommands: false,
    retryStrategy(times) {
      return (
        Math.min(250 * 2 ** Math.min(times - 1, 5), 5000) +
        Math.floor(Math.random() * 100)
      );
    },
  });
  redisClient = client;
  commandsReady = client.status === "ready";
  client.on("ready", () => {
    if (redisClient === client) commandsReady = true;
    logger.info("Redis ready");
  });
  client.on("error", () => {
    if (redisClient === client) commandsReady = false;
    recordEvent("redis", "unavailable");
  });
  client.on("close", () => {
    if (redisClient === client) commandsReady = false;
    recordEvent("redis", "disconnected");
  });
  client.connect().catch(() => recordEvent("redis", "connect_failed"));
  return client;
}

function isRedisReady() {
  return Boolean(
    commandsReady && redisClient && redisClient.status === "ready",
  );
}

async function initializeRedis() {
  if (!env.RATE_LIMIT_ENABLED) return true;
  const client = getRedisClient();
  if (!client) {
    recordEvent("redis", "unconfigured");
    return false;
  }
  if (isRedisReady()) return true;
  let ready;
  try {
    await deadline(
      () =>
        new Promise((resolve) => {
          ready = resolve;
          client.once("ready", ready);
        }),
      env.REDIS_CONNECT_TIMEOUT_MS,
    );
    return isRedisReady();
  } catch {
    recordEvent("redis", "startup_unavailable");
    return false;
  } finally {
    if (ready) client.removeListener("ready", ready);
  }
}

async function executeRedisScript(name, lua, keys, args) {
  const client = getRedisClient();
  if (!isRedisReady()) throw new RedisUnavailableError();
  try {
    if (client.defineCommand && !client[name]) {
      client.defineCommand(name, { numberOfKeys: keys.length, lua });
    }
    // Overall deadline also covers script reload after NOSCRIPT and test doubles.
    return await deadline(
      () =>
        client[name]
          ? client[name](...keys, ...args)
          : client.eval(lua, keys.length, ...keys, ...args),
      env.REDIS_COMMAND_TIMEOUT_MS,
    );
  } catch (err) {
    recordEvent("redis", "command_failed");
    // Drop a stalled socket so command queues cannot grow forever. Recover in
    // the background; callers immediately follow their explicit failure policy.
    if (
      err instanceof RedisUnavailableError ||
      err.message === "Command timed out"
    ) {
      // Let ioredis reconnect after the socket's asynchronous close. A normal
      // disconnect followed immediately by connect can permanently end retries.
      if (redisClient === client) commandsReady = false;
      client.disconnect?.(true);
    }
    throw new RedisUnavailableError();
  }
}

async function closeRedis() {
  const client = redisClient;
  redisClient = null;
  commandsReady = false;
  if (!client) return;
  try {
    if (client.status === "ready") {
      await deadline(() => client.quit(), env.REDIS_COMMAND_TIMEOUT_MS);
    }
  } catch {
    recordEvent("redis", "shutdown_timeout");
  } finally {
    client.disconnect?.();
  }
}

function _setRedisClientForTesting(client, ready = true) {
  if (env.NODE_ENV !== "test") throw new Error("Test injection is disabled");
  redisClient = client;
  commandsReady = ready;
  if (client && client.status === undefined)
    client.status = ready ? "ready" : "end";
}
module.exports = {
  getRedisClient,
  isRedisReady,
  initializeRedis,
  executeRedisScript,
  closeRedis,
  RedisUnavailableError,
  _setRedisClientForTesting,
};
