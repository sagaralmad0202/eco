const Redis = require("ioredis");
const env = require("../config/env");
const logger = require("./logger");

let redisClient = null;
let isReady = false;

function createRedisClient() {
  if (redisClient) return redisClient;

  // In test environment, allow using an in-memory mock if requested
  if (process.env.NODE_ENV === "test" && process.env.USE_REDIS_MOCK === "true") {
    try {
      const RedisMock = require("ioredis-mock");
      redisClient = new RedisMock();
      isReady = true;
      return redisClient;
    } catch (e) {
      logger.warn({ err: e }, "ioredis-mock not found, falling back to real Redis client");
    }
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 5) {
        return 30000;
      }
      const delay = Math.min(times * 500, 3000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on("connect", () => {
    logger.info("Redis socket connected");
  });

  client.on("ready", () => {
    isReady = true;
    logger.info("Redis client ready to accept commands");
  });

  client.on("error", (err) => {
    isReady = false;
    // Log error without crashing the server
    logger.error({ err: err.message }, "Redis connection error");
  });

  client.on("close", () => {
    isReady = false;
    logger.warn("Redis connection closed");
  });

  client.on("reconnecting", (time) => {
    logger.info({ delayMs: time }, "Redis reconnecting");
  });

  // Attempt initial connect asynchronously
  client.connect().catch((err) => {
    isReady = false;
    logger.warn({ err: err.message }, "Initial Redis connection failed");
  });

  redisClient = client;
  return redisClient;
}

function getRedisClient() {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
}

function isRedisReady() {
  return isReady && redisClient !== null && redisClient.status === "ready";
}

async function closeRedis() {
  if (redisClient) {
    try {
      isReady = false;
      await redisClient.quit();
      logger.info("Redis client cleanly disconnected");
    } catch (err) {
      logger.error({ err }, "Error during Redis disconnect");
      redisClient.disconnect();
    } finally {
      redisClient = null;
    }
  }
}

// Allows unit tests to inject a mock Redis instance
function _setRedisClientForTesting(client, ready = true) {
  redisClient = client;
  isReady = ready;
}

module.exports = {
  getRedisClient,
  isRedisReady,
  closeRedis,
  _setRedisClientForTesting,
};
