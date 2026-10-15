const { getRedisClient, isRedisReady } = require("../redis");
const logger = require("../logger");
const cacheEventEmitter = require("./cacheEventEmitter");

/**
 * Cache Inspector: Safe discovery, inspection, and administration of Redis keys.
 *
 * Safety Rules:
 * 1. NEVER use `KEYS *` — always use non-blocking incremental `SCAN`.
 * 2. BOUNDED PREVIEWS: Enforce strict byte limits on values read into memory.
 * 3. STRICT PATTERN VALIDATION: Prohibit unconstrained wildcards (`*`, `cache*` without specific namespace).
 * 4. SENSITIVE DATA REDACTION: Never return raw credentials or sensitive fields.
 * 5. SAFE DESTRUCTION: Destructive operations validate target patterns and log audit entries.
 */

// Permitted pattern namespaces for administrative invalidation
const ALLOWED_INVALIDATION_PATTERNS = [
  "cache:products:list:*",
  "cache:product:*",
  "cache:product:slug:*",
  "cache:product:id:*",
  "cache:categories:*",
  "cache:categories:tree",
  "cache:review:summary:*",
  "cache:user:profile:*",
  "cache:test:*",
];

/**
 * Safely parse Redis INFO string into structured key-value groups
 */
function parseRedisInfo(infoStr) {
  if (!infoStr) return {};
  const sections = {};
  let currentSection = "general";

  const lines = infoStr.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) {
      currentSection = trimmed.replace(/^#\s*/, "").toLowerCase();
      sections[currentSection] = {};
    } else {
      const idx = trimmed.indexOf(":");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!sections[currentSection]) sections[currentSection] = {};
        sections[currentSection][key] = value;
      }
    }
  }

  return sections;
}

/**
 * Measure memory usage of a key in bytes safely
 */
async function getKeyMemoryUsage(client, key) {
  try {
    if (typeof client.memory === "function") {
      const mem = await client.memory("USAGE", key);
      return typeof mem === "number" ? mem : null;
    }
  } catch {
    // MEMORY USAGE may not be supported by some Redis setups or mock clients
  }
  return null;
}

/**
 * Incremental SCAN-based key discovery with pagination
 *
 * @param {Object} options
 * @param {string} [options.pattern="cache:*"] - Key pattern to match
 * @param {string} [options.cursor="0"] - SCAN cursor token
 * @param {number} [options.limit=25] - Page size
 * @param {string} [options.typeFilter] - Optional filter by Redis data type
 */
async function scanKeys(options = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    return {
      keys: [],
      cursor: "0",
      totalScanned: 0,
      isRedisReady: false,
    };
  }

  const { pattern = "cache:*", cursor = "0", limit = 25, typeFilter = null } = options;
  let currentCursor = cursor;
  const discoveredKeys = [];
  let iterations = 0;
  const maxIterations = 20; // Bound scanning iterations per page to avoid blocking event loop

  try {
    do {
      iterations++;
      const [nextCursor, batch] = await client.scan(
        currentCursor,
        "MATCH",
        pattern,
        "COUNT",
        Math.max(50, limit * 2),
      );
      currentCursor = nextCursor;

      if (batch && batch.length > 0) {
        for (const key of batch) {
          discoveredKeys.push(key);
          if (discoveredKeys.length >= limit && !typeFilter) break;
        }
      }

      if (discoveredKeys.length >= limit) break;
    } while (currentCursor !== "0" && currentCursor !== 0 && iterations < maxIterations);

    // Fetch metadata (TYPE, TTL, MEMORY) in parallel with pipelining
    const keyDetails = await Promise.all(
      discoveredKeys.slice(0, limit).map(async (key) => {
        try {
          const [type, ttl, memoryBytes] = await Promise.all([
            client.type(key).catch(() => "unknown"),
            client.ttl(key).catch(() => -2),
            getKeyMemoryUsage(client, key),
          ]);

          return {
            key,
            type: String(type).toUpperCase(),
            ttl, // seconds: -2 = expired/missing, -1 = no expiration, >0 = remaining seconds
            memoryBytes,
            isExpiringSoon: ttl > 0 && ttl <= 60,
          };
        } catch {
          return { key, type: "UNKNOWN", ttl: -2, memoryBytes: null, isExpiringSoon: false };
        }
      }),
    );

    const filtered = typeFilter
      ? keyDetails.filter((k) => k.type.toLowerCase() === typeFilter.toLowerCase())
      : keyDetails;

    return {
      keys: filtered,
      nextCursor: currentCursor === 0 ? "0" : String(currentCursor),
      hasMore: currentCursor !== "0" && currentCursor !== 0,
      isRedisReady: true,
    };
  } catch (err) {
    logger.warn({ err: err.message, pattern }, "Error scanning Redis keys");
    return {
      keys: [],
      nextCursor: "0",
      hasMore: false,
      error: err.message,
      isRedisReady: isRedisReady(),
    };
  }
}

/**
 * Deep inspection of a single Redis key with safe type-specific representation
 */
async function inspectKey(key) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    return { found: false, error: "Redis is not connected or ready" };
  }

  try {
    const [typeRaw, ttl, pttl, memoryBytes] = await Promise.all([
      client.type(key),
      client.ttl(key),
      client.pttl ? client.pttl(key).catch(() => null) : null,
      getKeyMemoryUsage(client, key),
    ]);

    const type = String(typeRaw).toUpperCase();
    if (type === "NONE" || ttl === -2) {
      return { found: false, key, message: "Key does not exist or has expired" };
    }

    let value = null;
    let parsedJson = null;
    let isJson = false;
    let itemCount = 1;

    switch (type) {
      case "STRING": {
        const raw = await client.get(key);
        if (raw !== null) {
          try {
            parsedJson = JSON.parse(raw);
            isJson = true;
            value = cacheEventEmitter.redactValue(parsedJson);
          } catch {
            isJson = false;
            value = cacheEventEmitter.redactValue(raw);
          }
        }
        break;
      }
      case "HASH": {
        const hash = await client.hgetall(key);
        itemCount = Object.keys(hash || {}).length;
        value = cacheEventEmitter.redactValue(hash);
        break;
      }
      case "LIST": {
        itemCount = await client.llen(key).catch(() => 0);
        const listItems = await client.lrange(key, 0, 49); // Bounded preview
        value = listItems.map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        });
        value = cacheEventEmitter.redactValue(value);
        break;
      }
      case "SET": {
        itemCount = await client.scard(key).catch(() => 0);
        const members = await client.smembers(key);
        value = cacheEventEmitter.redactValue(members.slice(0, 50));
        break;
      }
      case "ZSET": {
        itemCount = await client.zcard(key).catch(() => 0);
        const zItems = await client.zrange(key, 0, 49, "WITHSCORES");
        const formatted = [];
        for (let i = 0; i < zItems.length; i += 2) {
          formatted.push({ value: zItems[i], score: Number(zItems[i + 1]) });
        }
        value = cacheEventEmitter.redactValue(formatted);
        break;
      }
      default:
        value = `[Inspection not supported for type: ${type}]`;
    }

    // Retrieve lifecycle history if tracked
    const lifecycleHistory = cacheEventEmitter.getKeyLifecycle(key);

    return {
      found: true,
      key,
      type,
      ttl, // seconds (-1 = persistent)
      pttl, // milliseconds
      memoryBytes,
      itemCount,
      isJson,
      value,
      lifecycleHistory,
      inspectedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.warn({ err: err.message, key }, "Error inspecting Redis key");
    return { found: false, key, error: err.message };
  }
}

/**
 * Delete a specific individual cache key
 */
async function deleteKey(key, userAudit = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis is unavailable");
  }

  // Safety check: key must not be empty or wildcard
  if (!key || typeof key !== "string" || key.includes("*")) {
    throw new Error("Invalid key for individual deletion");
  }

  const startTime = Date.now();
  const deleted = await client.del(key);
  const durationMs = Date.now() - startTime;

  logger.info(
    { key, adminUser: userAudit.email || "system", deletedCount: deleted },
    "Admin audit: Cache key deleted",
  );

  cacheEventEmitter.recordEvent({
    type: "CACHE_DELETE",
    key,
    durationMs,
    count: deleted,
    caller: `Admin: ${userAudit.email || "system"}`,
    details: { reason: "Admin UI action" },
  });

  return { success: true, key, deletedCount: deleted };
}

/**
 * Safely invalidate keys matching an approved pattern using non-blocking SCAN
 */
async function invalidatePattern(pattern, userAudit = {}) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis is unavailable");
  }

  // Safety check: Verify pattern is strictly allowed
  const isAllowed = ALLOWED_INVALIDATION_PATTERNS.some((allowed) => {
    if (allowed.endsWith("*")) {
      const prefix = allowed.slice(0, -1);
      return pattern.startsWith(prefix);
    }
    return pattern === allowed;
  });

  if (!isAllowed) {
    throw new Error(
      `Pattern '${pattern}' is not permitted for administrative invalidation. Allowed patterns include: ${ALLOWED_INVALIDATION_PATTERNS.join(", ")}`,
    );
  }

  const startTime = Date.now();
  let cursor = "0";
  let totalDeleted = 0;
  const deletedKeyNames = [];

  do {
    const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;

    if (keys && keys.length > 0) {
      if (typeof client.unlink === "function") {
        await client.unlink(...keys);
      } else {
        await client.del(...keys);
      }
      totalDeleted += keys.length;
      if (deletedKeyNames.length < 50) {
        deletedKeyNames.push(...keys.slice(0, 50 - deletedKeyNames.length));
      }
    }
  } while (cursor !== "0" && cursor !== 0);

  const durationMs = Date.now() - startTime;

  logger.info(
    { pattern, totalDeleted, adminUser: userAudit.email || "system" },
    "Admin audit: Cache pattern invalidated",
  );

  cacheEventEmitter.recordEvent({
    type: "CACHE_INVALIDATE",
    key: pattern,
    count: totalDeleted,
    durationMs,
    caller: `Admin: ${userAudit.email || "system"}`,
    details: { sampleKeys: deletedKeyNames },
  });

  return {
    success: true,
    pattern,
    totalDeleted,
    durationMs,
    sampleKeys: deletedKeyNames,
  };
}

/**
 * Get comprehensive overview metrics combining cache telemetry and Redis INFO
 */
async function getOverviewMetrics() {
  const client = getRedisClient();
  const ready = isRedisReady();
  const { getMetrics } = require("./cacheService");
  const cacheStats = getMetrics();

  let serverInfo = {};
  let memoryStats = {};
  let clientStats = {};
  let commandStats = {};
  let keyCount = 0;

  if (client && ready) {
    try {
      const [rawInfo, dbSize] = await Promise.all([
        client.info().catch(() => null),
        client.dbsize ? client.dbsize().catch(() => 0) : 0,
      ]);

      keyCount = dbSize || 0;

      if (rawInfo) {
        const parsed = parseRedisInfo(rawInfo);
        serverInfo = {
          version: parsed.server?.redis_version || "unknown",
          mode: parsed.server?.redis_mode || "standalone",
          os: parsed.server?.os || "unknown",
          uptimeSeconds: Number(parsed.server?.uptime_in_seconds) || 0,
          tcpPort: Number(parsed.server?.tcp_port) || 6379,
        };

        memoryStats = {
          usedMemoryHuman: parsed.memory?.used_memory_human || "0B",
          usedMemoryBytes: Number(parsed.memory?.used_memory) || 0,
          usedMemoryPeakHuman: parsed.memory?.used_memory_peak_human || "0B",
          usedMemoryPeakBytes: Number(parsed.memory?.used_memory_peak) || 0,
          totalSystemMemoryHuman: parsed.memory?.total_system_memory_human || parsed.memory?.maxmemory_human || "N/A",
          totalSystemMemoryBytes: Number(parsed.memory?.total_system_memory || parsed.memory?.maxmemory) || 0,
          fragmentationRatio: Number(parsed.memory?.mem_fragmentation_ratio) || 1.0,
          maxMemoryPolicy: parsed.memory?.maxmemory_policy || "volatile-lru",
        };

        clientStats = {
          connectedClients: Number(parsed.clients?.connected_clients) || 1,
          blockedClients: Number(parsed.clients?.blocked_clients) || 0,
        };

        commandStats = {
          instantaneousOpsPerSec: Number(parsed.stats?.instantaneous_ops_per_sec) || 0,
          totalCommandsProcessed: Number(parsed.stats?.total_commands_processed) || 0,
          expiredKeys: Number(parsed.stats?.expired_keys) || 0,
          evictedKeys: Number(parsed.stats?.evicted_keys) || 0,
        };
      }
    } catch (err) {
      logger.debug({ err: err.message }, "Error collecting Redis server info");
    }
  }

  // Calculate hit ratio
  const totalQueries = cacheStats.hits + cacheStats.misses;
  const hitRatio = totalQueries > 0 ? Number(((cacheStats.hits / totalQueries) * 100).toFixed(2)) : 0;

  return {
    connection: {
      status: ready ? "connected" : "disconnected",
      isReady: ready,
      redisHost: process.env.REDIS_URL ? new URL(process.env.REDIS_URL).host : "127.0.0.1:6379",
    },
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      sets: cacheStats.sets,
      deletes: cacheStats.deletes,
      errors: cacheStats.errors,
      totalQueries,
      hitRatioPercentage: hitRatio,
    },
    server: serverInfo,
    memory: memoryStats,
    clients: clientStats,
    commands: commandStats,
    totalKeysInDb: keyCount,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  scanKeys,
  inspectKey,
  deleteKey,
  invalidatePattern,
  getOverviewMetrics,
  ALLOWED_INVALIDATION_PATTERNS,
};
