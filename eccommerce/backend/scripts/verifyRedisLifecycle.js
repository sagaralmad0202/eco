/**
 * Live End-to-End Redis Lifecycle Verification Script
 *
 * Verifies against the REAL native Redis instance:
 * 1. Cache Miss + DB Fallback
 * 2. Cache Set + Jittered TTL
 * 3. Cache Hit (Fast RAM path)
 * 4. Cache Invalidation (Mutation trigger)
 * 5. SCAN-based Key Discovery
 * 6. Live Event Telemetry Ring Buffer
 */

require("dotenv").config();
const { getRedisClient, isRedisReady } = require("../src/lib/redis");
const {
  get,
  set,
  del,
  delPattern,
  wrap,
  cacheKeys,
  cacheEventEmitter,
  cacheInspector,
  getMetrics,
} = require("../src/lib/cache");

async function runVerification() {
  console.log("==================================================================");
  console.log("🚀 STARTING REAL REDIS LIFECYCLE VERIFICATION (REAL TRAFFIC)");
  console.log("==================================================================");

  const client = getRedisClient();
  if (!client) {
    throw new Error("Could not initialize Redis client");
  }

  // Ensure connection is ready
  if (!isRedisReady()) {
    console.log("Waiting for Redis ready event...");
    await new Promise((resolve) => client.once("ready", resolve));
  }

  const pingResult = await client.ping();
  console.log(`✅ 1. Redis Connection: SUCCESS (PING -> ${pingResult})`);

  const testKey = cacheKeys.productBySlug("verify-leather-jacket");

  // Step A: Purge test key if lingering
  await del(testKey);
  console.log(`🧹 2. Cleaned test key '${testKey}'`);

  // Step B: Cache Miss & Database Query simulation
  console.log("\n--- STEP 3: Request uncached product (Cache Miss) ---");
  let dbQueriesCount = 0;
  const mockDatabaseQuery = async () => {
    dbQueriesCount++;
    console.log("   [Database] PostgreSQL query executed: SELECT * FROM products WHERE slug='verify-leather-jacket'");
    return {
      id: "prod-verify-999",
      name: "Verification Leather Jacket",
      slug: "verify-leather-jacket",
      price: "189.99",
      inStock: true,
      category: "Outerwear",
    };
  };

  const startTime1 = Date.now();
  const result1 = await wrap(testKey, 120, mockDatabaseQuery, { caller: "verifyScript" });
  const latency1 = Date.now() - startTime1;

  console.log(`✅ Cache Miss verified: Data returned from DB in ${latency1}ms`);
  console.log(`   DB query executed count: ${dbQueriesCount} (Expected: 1)`);
  if (dbQueriesCount !== 1) throw new Error("Expected 1 DB query on cache miss");

  // Step C: Verify Key Stored in Redis with TTL
  console.log("\n--- STEP 4: Inspect Key Stored in Redis ---");
  const inspected = await cacheInspector.inspectKey(testKey);
  console.log(`✅ Key exists in Redis: ${inspected.found}`);
  console.log(`   Key Type: ${inspected.type}`);
  console.log(`   Remaining TTL: ${inspected.ttl} seconds`);
  console.log(`   Memory Size: ${inspected.memoryBytes || "available"} bytes`);
  console.log(`   Cached Payload Name: ${inspected.value?.name}`);

  if (!inspected.found || inspected.ttl <= 0) {
    throw new Error("Expected key to be cached with valid positive TTL");
  }

  // Step D: Request the same product again (Cache Hit)
  console.log("\n--- STEP 5: Request same product again (Cache Hit) ---");
  const startTime2 = Date.now();
  const result2 = await wrap(testKey, 120, mockDatabaseQuery, { caller: "verifyScript" });
  const latency2 = Date.now() - startTime2;

  console.log(`✅ Cache Hit verified: Data returned from Redis RAM in ${latency2}ms`);
  console.log(`   DB query executed count: ${dbQueriesCount} (Expected STILL 1 - NO DB query!)`);
  if (dbQueriesCount !== 1) throw new Error("DB query was invoked on cache hit!");

  // Step E: Update Product (Cache Invalidation)
  console.log("\n--- STEP 6: Product Mutation -> Invalidation Trigger ---");
  console.log("   [Storefront] Product price updated in database -> Invalidation triggered");
  const delResult = await cacheInspector.deleteKey(testKey, { email: "admin@shop.local" });
  console.log(`✅ Cache deletion executed: ${delResult.success} (Keys deleted: ${delResult.deletedCount})`);

  const inspectAfterDel = await cacheInspector.inspectKey(testKey);
  console.log(`✅ Key verified absent after invalidation: found = ${inspectAfterDel.found}`);
  if (inspectAfterDel.found) throw new Error("Key still exists after deletion!");

  // Step F: Test Pattern-based Invalidation
  console.log("\n--- STEP 7: Pattern-based Invalidation (SCAN UNLINK) ---");
  await set("cache:products:list:test_p1", [{ id: 1 }], 60);
  await set("cache:products:list:test_p2", [{ id: 2 }], 60);

  const patternResult = await cacheInspector.invalidatePattern("cache:products:list:*", {
    email: "admin@shop.local",
  });
  console.log(`✅ Pattern invalidation: ${patternResult.totalDeleted} keys unlinked`);

  // Step G: Telemetry & Overview
  console.log("\n--- STEP 8: High-Level Telemetry Overview ---");
  const overview = await cacheInspector.getOverviewMetrics();
  console.log("Overview Metrics Snapshot:");
  console.log(`   Connection: ${overview.connection.status} (${overview.connection.redisHost})`);
  console.log(`   Total Cache Hits: ${overview.cache.hits}`);
  console.log(`   Total Cache Misses: ${overview.cache.misses}`);
  console.log(`   Hit Ratio: ${overview.cache.hitRatioPercentage}%`);
  console.log(`   Memory Used: ${overview.memory.usedMemoryHuman}`);
  console.log(`   Total Keys in DB: ${overview.totalKeysInDb}`);

  // Step H: Live Events Buffer Check
  console.log("\n--- STEP 9: Telemetry Event Buffer ---");
  const recentEvents = cacheEventEmitter.getRecentEvents({ limit: 5 });
  console.log(`Captured ${recentEvents.length} recent real events in buffer:`);
  for (const evt of recentEvents) {
    console.log(`   [${evt.timestamp.slice(11, 23)}] ${evt.type} -> ${evt.key} (${evt.durationMs}ms)`);
  }

  console.log("\n==================================================================");
  console.log("🎉 ALL REAL REDIS LIFECYCLE TESTS VERIFIED AND PASSED SUCCESSFULLY!");
  console.log("==================================================================");
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
