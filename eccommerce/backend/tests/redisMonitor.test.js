const {
  get,
  set,
  del,
  delPattern,
  wrap,
  cacheEventEmitter,
  cacheInspector,
  resetMetricsForTesting,
} = require("../src/lib/cache");

describe("Redis Real-Time Monitoring Subsystem", () => {
  beforeEach(() => {
    resetMetricsForTesting();
  });

  describe("Event Recording & Circular Buffer", () => {
    it("records CACHE_HIT and CACHE_MISS events automatically", async () => {
      // 1. Trigger Miss
      await get("cache:test:nonexistent-item");

      // 2. Trigger Set
      await set("cache:test:item-1", { name: "Test Sneakers", price: "49.99" }, 60);

      // 3. Trigger Hit
      await get("cache:test:item-1");

      const recent = cacheEventEmitter.getRecentEvents({ limit: 10 });
      expect(recent.length).toBeGreaterThanOrEqual(3);

      const types = recent.map((e) => e.type);
      expect(types).toContain("CACHE_MISS");
      expect(types).toContain("CACHE_SET");
      expect(types).toContain("CACHE_HIT");
    });

    it("enforces circular buffer bounding without memory leaks", () => {
      // Record 600 events (buffer cap is 500)
      for (let i = 0; i < 600; i++) {
        cacheEventEmitter.recordEvent({
          type: "CACHE_HIT",
          key: `cache:test:bulk:${i}`,
          durationMs: 0.5,
        });
      }

      const events = cacheEventEmitter.getRecentEvents({ limit: 1000 });
      expect(events.length).toBe(500);
      // First event should have dropped, oldest remaining should be around index 100
      expect(events[0].key).toBe("cache:test:bulk:100");
    });

    it("records key lifecycle history chronologically", async () => {
      const key = "cache:product:slug:summer-dress";

      // Sequence: miss -> set -> hit -> invalidate
      await get(key);
      await set(key, { title: "Summer Dress" }, 120);
      await get(key);
      await del(key);

      const lifecycle = cacheEventEmitter.getKeyLifecycle(key);
      expect(lifecycle.length).toBe(4);
      expect(lifecycle[0].type).toBe("CACHE_MISS");
      expect(lifecycle[1].type).toBe("CACHE_SET");
      expect(lifecycle[2].type).toBe("CACHE_HIT");
      expect(lifecycle[3].type).toBe("CACHE_DELETE");
    });
  });

  describe("Sensitive Data Redaction", () => {
    it("redacts passwords, tokens, secrets, and auth hashes from preview data", () => {
      const sensitiveData = {
        userId: "usr-123",
        email: "user@example.com",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
        accessToken: "jwt-token-string-value",
        creditCard: "4111222233334444",
        profile: {
          apiKey: "sk_live_123456789",
          fullName: "Alice Doe",
        },
      };

      const redacted = cacheEventEmitter.redactValue(sensitiveData);

      expect(redacted.passwordHash).toBe("[REDACTED]");
      expect(redacted.accessToken).toBe("[REDACTED]");
      expect(redacted.creditCard).toBe("[REDACTED]");
      expect(redacted.profile.apiKey).toBe("[REDACTED]");
      expect(redacted.profile.fullName).toBe("Alice Doe");
      expect(redacted.userId).toBe("usr-123");
    });
  });

  describe("Time-Series Metric Aggregation", () => {
    it("aggregates events into rolling minute buckets", () => {
      cacheEventEmitter.recordEvent({ type: "CACHE_HIT", durationMs: 1.5 });
      cacheEventEmitter.recordEvent({ type: "CACHE_HIT", durationMs: 2.5 });
      cacheEventEmitter.recordEvent({ type: "CACHE_MISS", durationMs: 1.0 });

      const metrics5m = cacheEventEmitter.getTimeSeriesMetrics("5m");
      expect(metrics5m.length).toBeGreaterThan(0);

      const currentBucket = metrics5m[metrics5m.length - 1];
      expect(currentBucket.hits).toBe(2);
      expect(currentBucket.misses).toBe(1);
      expect(currentBucket.hitRatio).toBeCloseTo(66.7, 0);
      expect(currentBucket.avgLatencyMs).toBe(1.67);
    });
  });

  describe("Safe Key Discovery & Inspection", () => {
    it("scans and categorizes keys without blocking", async () => {
      await set("cache:scan:k1", { a: 1 }, 10);
      await set("cache:scan:k2", { b: 2 }, 300);

      const scanResult = await cacheInspector.scanKeys({ pattern: "cache:scan:*" });
      expect(scanResult.isRedisReady).toBe(true);
      expect(scanResult.keys.length).toBeGreaterThanOrEqual(2);

      const k1 = scanResult.keys.find((k) => k.key === "cache:scan:k1");
      expect(k1).toBeDefined();
      expect(k1.type).toBe("STRING");
      expect(k1.ttl).toBeGreaterThan(0);
      expect(k1.isExpiringSoon).toBe(true); // <= 60s
    });

    it("inspects key structure and safely parses JSON", async () => {
      const payload = { id: "p-99", name: "Premium Boots", stock: 15 };
      await set("cache:inspect:boot", payload, 600);

      const detail = await cacheInspector.inspectKey("cache:inspect:boot");
      expect(detail.found).toBe(true);
      expect(detail.type).toBe("STRING");
      expect(detail.isJson).toBe(true);
      expect(detail.value).toEqual(payload);
      expect(detail.ttl).toBeGreaterThan(0);
    });
  });

  describe("Administrative Invalidation & Safety Guardrails", () => {
    it("deletes individual key with audit logging and event emission", async () => {
      await set("cache:test:to-del", { x: 1 }, 60);

      const result = await cacheInspector.deleteKey("cache:test:to-del", {
        email: "admin@shop.local",
      });
      expect(result.success).toBe(true);

      const valueAfter = await get("cache:test:to-del");
      expect(valueAfter).toBeNull();

      const recentEvents = cacheEventEmitter.getRecentEvents({ limit: 5 });
      const delEvent = recentEvents.find((e) => e.key === "cache:test:to-del" && e.type === "CACHE_DELETE");
      expect(delEvent).toBeDefined();
      expect(delEvent.caller).toContain("admin@shop.local");
    });

    it("rejects unauthorized or dangerous wildcard patterns like '*'", async () => {
      await expect(
        cacheInspector.invalidatePattern("*", { email: "admin@shop.local" }),
      ).rejects.toThrow("Pattern '*' is not permitted");

      await expect(
        cacheInspector.invalidatePattern("user*", { email: "admin@shop.local" }),
      ).rejects.toThrow("is not permitted");
    });

    it("invalidates permitted patterns safely", async () => {
      await set("cache:products:list:page1", [{ id: "1" }], 60);
      await set("cache:products:list:page2", [{ id: "2" }], 60);
      await set("cache:other:keep", { stay: true }, 60);

      const result = await cacheInspector.invalidatePattern("cache:products:list:*", {
        email: "admin@shop.local",
      });

      expect(result.success).toBe(true);
      expect(await get("cache:products:list:page1")).toBeNull();
      expect(await get("cache:products:list:page2")).toBeNull();
      expect(await get("cache:other:keep")).toEqual({ stay: true });
    });
  });

  describe("Non-Blocking & Resilience Guarantee", () => {
    it("ensures wrap() handles monitoring events without throwing on error", async () => {
      const dbQuery = jest.fn().mockResolvedValue({ status: "alive" });

      const res = await wrap("cache:test:safe-wrap", 60, dbQuery, {
        caller: "testSuite",
      });

      expect(res).toEqual({ status: "alive" });
      expect(dbQuery).toHaveBeenCalledTimes(1);

      const recent = cacheEventEmitter.getRecentEvents({ limit: 5 });
      const foundMiss = recent.find((e) => e.key === "cache:test:safe-wrap" && e.type === "CACHE_MISS");
      expect(foundMiss).toBeDefined();
    });
  });

  describe("Admin API Route Integration (/api/admin/redis)", () => {
    const request = require("supertest");
    const app = require("../src/app");
    const prisma = require("../src/lib/prisma");
    const { signAccessToken } = require("../src/utils/jwt");

    const adminUser = {
      id: "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
      email: "admin@shop.local",
      fullName: "Store Admin",
      role: "ADMIN",
      isActive: true,
      emailVerifiedAt: new Date(),
    };

    const customerUser = {
      id: "c1c1c1c1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
      email: "customer@shop.local",
      fullName: "Regular Customer",
      role: "CUSTOMER",
      isActive: true,
      emailVerifiedAt: new Date(),
    };

    let adminToken;
    let customerToken;

    beforeAll(() => {
      adminToken = signAccessToken(adminUser);
      customerToken = signAccessToken(customerUser);
    });

    it("rejects unauthenticated requests to /api/admin/redis/overview with 401", async () => {
      const res = await request(app).get("/api/admin/redis/overview");
      expect(res.status).toBe(401);
    });

    it("rejects non-admin customer accounts with 403 Forbidden", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(customerUser);

      const res = await request(app)
        .get("/api/admin/redis/overview")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      prisma.user.findUnique.mockRestore();
    });

    it("allows ADMIN users to retrieve overview metrics with 200 OK", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(adminUser);

      const res = await request(app)
        .get("/api/admin/redis/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.connection).toBeDefined();
      expect(res.body.data.cache).toBeDefined();
      prisma.user.findUnique.mockRestore();
    });

    it("allows ADMIN users to query keys via SCAN pagination", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(adminUser);
      await set("cache:api:k1", { foo: "bar" }, 60);

      const res = await request(app)
        .get("/api/admin/redis/keys?pattern=cache:api:*")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.keys)).toBe(true);
      prisma.user.findUnique.mockRestore();
    });
  });
});
