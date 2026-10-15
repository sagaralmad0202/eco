const { getRedisClient, isRedisReady } = require("../redis");
const logger = require("../logger");
const cacheEventEmitter = require("./cacheEventEmitter");

/**
 * Cache metrics for operational observability
 */
const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0,
};

/**
 * In-flight promise map for single-flight / cache stampede protection.
 * When multiple requests miss the same key simultaneously, only the first request
 * hits the database. Subsequent requests await the first request's promise.
 */
const inFlightPromises = new Map();

/**
 * Calculate TTL with optional jitter (+/- 10%) to prevent simultaneous cache expirations
 * (thundering herd problem).
 */
function calculateJitteredTtl(ttlSeconds, useJitter = true) {
  if (!useJitter || ttlSeconds <= 10) return ttlSeconds;
  const jitterRange = Math.floor(ttlSeconds * 0.1);
  const jitter = Math.floor(Math.random() * (jitterRange * 2 + 1)) - jitterRange;
  return Math.max(1, ttlSeconds + jitter);
}

/**
 * Safely parse JSON from Redis
 */
function safeJsonParse(data) {
  if (data === null || data === undefined) return null;
  try {
    return JSON.parse(data);
  } catch (err) {
    logger.warn({ err: err.message }, "Failed to parse cached JSON, treating as cache miss");
    return null;
  }
}

/**
 * Safely serialize value to JSON for Redis storage
 */
function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    logger.warn({ err: err.message }, "Failed to serialize value for cache storage");
    return null;
  }
}

/**
 * Get cached item by key. Returns null on miss or Redis unavailability.
 */
async function get(key, options = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return null;

  const start = Date.now();
  try {
    const raw = await client.get(key);
    const durationMs = Date.now() - start;

    if (raw === null || raw === undefined) {
      cacheMetrics.misses++;
      cacheEventEmitter.recordEvent({
        type: "CACHE_MISS",
        key,
        durationMs,
        source: "database",
        caller: options.caller || null,
        correlationId: options.correlationId || null,
      });
      return null;
    }

    cacheMetrics.hits++;
    const parsed = safeJsonParse(raw);

    cacheEventEmitter.recordEvent({
      type: "CACHE_HIT",
      key,
      durationMs,
      source: "cache",
      valuePreview: parsed,
      caller: options.caller || null,
      correlationId: options.correlationId || null,
    });

    return parsed;
  } catch (err) {
    cacheMetrics.errors++;
    const durationMs = Date.now() - start;

    cacheEventEmitter.recordEvent({
      type: "CACHE_ERROR",
      key,
      durationMs,
      details: { error: err.message, operation: "get" },
    });

    logger.warn({ err: err.message, key }, "Redis get error, failing open to database");
    return null;
  }
}

/**
 * Set cached item with TTL in seconds.
 * Silently catches errors to preserve system availability.
 */
async function set(key, value, ttlSeconds = 300, options = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return false;

  const serialized = safeJsonStringify(value);
  if (serialized === null) return false;

  const finalTtl = calculateJitteredTtl(ttlSeconds, options.jitter !== false);
  const start = Date.now();

  try {
    await client.setex(key, finalTtl, serialized);
    const durationMs = Date.now() - start;

    cacheMetrics.sets++;
    cacheEventEmitter.recordEvent({
      type: "CACHE_SET",
      key,
      ttl: finalTtl,
      durationMs,
      source: "database",
      valuePreview: value,
      caller: options.caller || null,
      correlationId: options.correlationId || null,
    });

    return true;
  } catch (err) {
    cacheMetrics.errors++;
    const durationMs = Date.now() - start;

    cacheEventEmitter.recordEvent({
      type: "CACHE_ERROR",
      key,
      durationMs,
      details: { error: err.message, operation: "setex" },
    });

    logger.warn({ err: err.message, key }, "Redis setex error, proceeding without cache");
    return false;
  }
}

/**
 * Delete a specific cache key.
 */
async function del(key, options = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return false;

  const start = Date.now();
  try {
    const deletedCount = await client.del(key);
    const durationMs = Date.now() - start;

    cacheMetrics.deletes += deletedCount;
    cacheEventEmitter.recordEvent({
      type: "CACHE_DELETE",
      key,
      durationMs,
      count: deletedCount,
      caller: options.caller || null,
      correlationId: options.correlationId || null,
    });

    return true;
  } catch (err) {
    cacheMetrics.errors++;
    const durationMs = Date.now() - start;

    cacheEventEmitter.recordEvent({
      type: "CACHE_ERROR",
      key,
      durationMs,
      details: { error: err.message, operation: "del" },
    });

    logger.warn({ err: err.message, key }, "Redis del error");
    return false;
  }
}

/**
 * Invalidate keys matching a pattern. Uses SCAN instead of KEYS to avoid blocking
 * Redis single-threaded event loop in production.
 */
async function delPattern(pattern, options = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return false;

  const start = Date.now();
  try {
    let cursor = "0";
    let totalDeleted = 0;

    do {
      // SCAN cursor MATCH pattern COUNT 100
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;

      if (keys && keys.length > 0) {
        // Unlink or del in batches
        if (typeof client.unlink === "function") {
          await client.unlink(...keys);
        } else {
          await client.del(...keys);
        }
        totalDeleted += keys.length;
      }
    } while (cursor !== "0" && cursor !== 0);

    const durationMs = Date.now() - start;
    cacheMetrics.deletes += totalDeleted;

    cacheEventEmitter.recordEvent({
      type: "CACHE_INVALIDATE",
      key: pattern,
      durationMs,
      count: totalDeleted,
      caller: options.caller || null,
      correlationId: options.correlationId || null,
    });

    return true;
  } catch (err) {
    cacheMetrics.errors++;
    const durationMs = Date.now() - start;

    cacheEventEmitter.recordEvent({
      type: "CACHE_ERROR",
      key: pattern,
      durationMs,
      details: { error: err.message, operation: "delPattern" },
    });

    logger.warn({ err: err.message, pattern }, "Redis delPattern error");
    return false;
  }
}

/**
 * Cache-Aside Helper with Single-Flight / Stampede Protection
 *
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @param {Function} fetchFn - Database query function executed on cache miss
 * @param {Object} [options] - Optional settings (e.g. { jitter: true, caller: 'listProducts' })
 */
async function wrap(key, ttlSeconds, fetchFn, options = {}) {
  // 1. Try reading from Redis first
  const cached = await get(key, options);
  if (cached !== null) {
    return cached;
  }

  // 2. Cache miss: Check if there's already an in-flight fetch for this identical key
  if (inFlightPromises.has(key)) {
    try {
      return await inFlightPromises.get(key);
    } catch {
      // In-flight request failed; fall through to direct execution
    }
  }

  // 3. Initiate single-flight execution
  const fetchPromise = (async () => {
    try {
      const freshData = await fetchFn();
      if (freshData !== undefined && freshData !== null) {
        try {
          await set(key, freshData, ttlSeconds, options);
        } catch (err) {
          logger.warn({ err: err.message, key }, "Cache population failed");
        }
      }
      return freshData;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Operational stats / telemetry
 */
function getMetrics() {
  const totalQueries = cacheMetrics.hits + cacheMetrics.misses;
  const hitRatio = totalQueries > 0 ? (cacheMetrics.hits / totalQueries).toFixed(4) : "0.0000";

  return {
    ...cacheMetrics,
    totalQueries,
    hitRatio: parseFloat(hitRatio),
    isReady: isRedisReady(),
  };
}

function resetMetricsForTesting() {
  cacheMetrics.hits = 0;
  cacheMetrics.misses = 0;
  cacheMetrics.sets = 0;
  cacheMetrics.deletes = 0;
  cacheMetrics.errors = 0;
  inFlightPromises.clear();
  cacheEventEmitter.resetForTesting();
}

async function clearCacheForTesting() {
  resetMetricsForTesting();
  const client = getRedisClient();
  if (client && typeof client.flushall === "function") {
    await client.flushall();
  }
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  wrap,
  getMetrics,
  calculateJitteredTtl,
  resetMetricsForTesting,
  clearCacheForTesting,
};
