const {
  get,
  set,
  del,
  delPattern,
  wrap,
  cacheKeys,
  hashQuery,
  getMetrics,
  resetMetricsForTesting,
  calculateJitteredTtl,
  CACHE_TTL,
} = require("../src/lib/cache");
const redisLib = require("../src/lib/redis");

describe("Redis Cache Subsystem Unit & Integration Tests", () => {
  beforeEach(() => {
    resetMetricsForTesting();
  });

  describe("Query Hashing and Cache Keys", () => {
    it("generates deterministic hash regardless of query key order", () => {
      const hash1 = hashQuery({ page: 1, limit: 10, category: "shoes" });
      const hash2 = hashQuery({ limit: 10, category: "shoes", page: 1 });
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
    });

    it("handles array values consistently", () => {
      const hash1 = hashQuery({ sizes: ["M", "L", "XL"] });
      const hash2 = hashQuery({ sizes: ["XL", "M", "L"] });
      expect(hash1).toBe(hash2);
    });

    it("generates correct key namespaces", () => {
      expect(cacheKeys.productBySlug("red-sneakers")).toBe(
        "cache:product:slug:red-sneakers",
      );
      expect(cacheKeys.productById("prod-123")).toBe("cache:product:id:prod-123");
      expect(cacheKeys.categoryTree()).toBe("cache:categories:tree");
      expect(cacheKeys.reviewSummary("prod-123")).toBe(
        "cache:review:summary:prod-123",
      );
      expect(cacheKeys.userProfile("usr-456")).toBe("cache:user:profile:usr-456");
      expect(cacheKeys.allProductListsPattern()).toBe("cache:products:list:*");
    });
  });

  describe("TTL Jitter Calculation", () => {
    it("applies +/- 10% jitter for high-volume keys", () => {
      const baseTtl = 600;
      for (let i = 0; i < 20; i++) {
        const jittered = calculateJitteredTtl(baseTtl, true);
        expect(jittered).toBeGreaterThanOrEqual(540);
        expect(jittered).toBeLessThanOrEqual(660);
      }
    });

    it("does not apply jitter if disabled", () => {
      expect(calculateJitteredTtl(600, false)).toBe(600);
    });
  });

  describe("Cache-Aside get/set/del with Redis Mock", () => {
    it("returns null on cache miss", async () => {
      const result = await get("cache:test:missing-key");
      expect(result).toBeNull();
      const metrics = getMetrics();
      expect(metrics.misses).toBe(1);
    });

    it("sets value with TTL and retrieves it correctly", async () => {
      const testData = { id: "123", name: "Classic Tee", price: "29.99" };
      const ok = await set("cache:test:item", testData, 60, { jitter: false });
      expect(ok).toBe(true);

      const cached = await get("cache:test:item");
      expect(cached).toEqual(testData);

      const metrics = getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.sets).toBe(1);
    });

    it("deletes a key successfully", async () => {
      await set("cache:test:to-delete", { foo: "bar" }, 60);
      expect(await get("cache:test:to-delete")).toEqual({ foo: "bar" });

      const delOk = await del("cache:test:to-delete");
      expect(delOk).toBe(true);

      expect(await get("cache:test:to-delete")).toBeNull();
    });

    it("deletes keys matching a wildcard pattern", async () => {
      await set("cache:products:list:abc", [{ id: "1" }], 60);
      await set("cache:products:list:def", [{ id: "2" }], 60);
      await set("cache:other:keep", { stay: true }, 60);

      await delPattern("cache:products:list:*");

      expect(await get("cache:products:list:abc")).toBeNull();
      expect(await get("cache:products:list:def")).toBeNull();
      expect(await get("cache:other:keep")).toEqual({ stay: true });
    });
  });

  describe("wrap() - Cache-Aside & Stampede Protection", () => {
    it("executes fetchFn on miss, stores in cache, and returns cached on next call", async () => {
      const dbMock = jest.fn().mockResolvedValue({ id: "prod-1", name: "Shoes" });

      // First call -> Cache Miss -> DB queried
      const res1 = await wrap("cache:test:wrap-1", 60, dbMock);
      expect(res1).toEqual({ id: "prod-1", name: "Shoes" });
      expect(dbMock).toHaveBeenCalledTimes(1);

      // Second call -> Cache Hit -> Served from Redis without DB query
      const res2 = await wrap("cache:test:wrap-1", 60, dbMock);
      expect(res2).toEqual({ id: "prod-1", name: "Shoes" });
      expect(dbMock).toHaveBeenCalledTimes(1); // Still 1!
    });

    it("protects against cache stampede by coalescing concurrent in-flight requests", async () => {
      let dbCalls = 0;
      const slowDbQuery = async () => {
        dbCalls++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { data: "stampede-safe" };
      };

      // 5 concurrent requests for the exact same uncached key
      const results = await Promise.all([
        wrap("cache:test:stampede", 60, slowDbQuery),
        wrap("cache:test:stampede", 60, slowDbQuery),
        wrap("cache:test:stampede", 60, slowDbQuery),
        wrap("cache:test:stampede", 60, slowDbQuery),
        wrap("cache:test:stampede", 60, slowDbQuery),
      ]);

      // All 5 requests receive the correct response
      for (const res of results) {
        expect(res).toEqual({ data: "stampede-safe" });
      }

      // But the database query was executed only ONCE!
      expect(dbCalls).toBe(1);
    });
  });

  describe("Resilience and Fail-Open Behavior", () => {
    it("fails open to database if Redis get/set throws an error", async () => {
      const client = redisLib.getRedisClient();
      const originalGet = client.get;

      // Simulate Redis socket or command failure
      client.get = jest.fn().mockRejectedValue(new Error("Redis connection dropped"));

      const dbQuery = jest.fn().mockResolvedValue({ status: "alive" });
      const result = await wrap("cache:test:fail-open", 60, dbQuery);

      expect(result).toEqual({ status: "alive" });
      expect(dbQuery).toHaveBeenCalledTimes(1);

      // Restore client method
      client.get = originalGet;
    });

    it("reports healthy metrics and hit ratio", async () => {
      await set("cache:metric:test", { a: 1 }, 60);
      await get("cache:metric:test"); // Hit
      await get("cache:metric:nonexistent"); // Miss

      const metrics = getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.totalQueries).toBe(2);
      expect(metrics.hitRatio).toBe(0.5);
    });
  });
});
