// ---------------------------------------------------------------------------
// Idempotency middleware — unit tests
//
// Follows the same mock-Prisma pattern as order.service.test.js and
// payment.service.test.js: all database calls are stubbed so the tests run
// without a live PostgreSQL connection.
// ---------------------------------------------------------------------------

const { createHash } = require("crypto");

// ---- Prisma mock -----------------------------------------------------------

const mockPrisma = {
  $executeRawUnsafe: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  idempotencyKey: {
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

// ---- Module under test -----------------------------------------------------

const { idempotency, hashRequestBody, LOCK_TIMEOUT_MS } = require("../src/middleware/idempotency");

// ---- Helpers ---------------------------------------------------------------

const USER_ID = "8c04efed-21f2-4389-9782-e4ec3aacd702";
const OTHER_USER_ID = "6e94238a-09f7-451a-ac9a-832e7d4e8086";
const IDEM_KEY = "8f7a9c21-1234-4567-abcd-ef0123456789";
const RECORD_ID = "a1aa64e6-67e4-4b07-80b1-da9ec83cac93";

function makeReq(overrides = {}) {
  return {
    headers: { "idempotency-key": IDEM_KEY },
    user: { id: USER_ID },
    originalUrl: "/api/orders",
    url: "/api/orders",
    body: { addressId: "addr-123" },
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    ...overrides,
  };
}

function makeRes() {
  const res = {
    statusCode: 200,
    _headers: {},
    _body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res._body = body;
      return res;
    },
    setHeader(k, v) {
      res._headers[k] = v;
    },
    on: jest.fn(),
  };
  return res;
}

function bodyHash(body) {
  const canonical = JSON.stringify(body ?? {}, Object.keys(body ?? {}).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

function makeRecord(overrides = {}) {
  return {
    id: RECORD_ID,
    key: IDEM_KEY,
    userId: USER_ID,
    requestPath: "/api/orders",
    requestHash: bodyHash({ addressId: "addr-123" }),
    status: "PROCESSING",
    responseStatus: null,
    responseBody: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

// ---- Setup -----------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---- Tests -----------------------------------------------------------------

describe("hashRequestBody", () => {
  test("produces a 64-char hex digest", () => {
    const hash = hashRequestBody({ a: 1, b: 2 });
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("is order-independent (sorted keys)", () => {
    const h1 = hashRequestBody({ b: 2, a: 1 });
    const h2 = hashRequestBody({ a: 1, b: 2 });
    expect(h1).toBe(h2);
  });

  test("handles empty/null body", () => {
    const h1 = hashRequestBody(null);
    const h2 = hashRequestBody(undefined);
    const h3 = hashRequestBody({});
    expect(h1).toBe(h2);
    expect(h2).toBe(h3);
  });

  test("different bodies produce different hashes", () => {
    const h1 = hashRequestBody({ amount: 1000 });
    const h2 = hashRequestBody({ amount: 5000 });
    expect(h1).not.toBe(h2);
  });
});

describe("idempotency middleware", () => {
  const middleware = idempotency();

  // Test 5 — Missing key
  test("returns 400 when Idempotency-Key header is missing", async () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Idempotency-Key header is required"),
      }),
    );
  });

  test("returns 400 for an invalid key format", async () => {
    const req = makeReq({ headers: { "idempotency-key": "ab" } }); // too short
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  test("returns 401 when req.user is missing", async () => {
    const req = makeReq({ user: null });
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  // Test 1 — First request: creates record, continues to handler
  test("creates a new record and calls next() for a first-time key", async () => {
    const freshRecord = makeRecord();

    mockPrisma.$executeRawUnsafe.mockResolvedValue(1);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([freshRecord]);

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Should have called INSERT ... ON CONFLICT
    expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT"),
      IDEM_KEY,
      USER_ID,
      "/api/orders",
      expect.any(String),
      expect.any(Date),
    );

    // Should proceed to the handler (next called without error)
    expect(next).toHaveBeenCalledWith();
    expect(req.idempotencyId).toBe(RECORD_ID);
  });

  // Test 2 — Duplicate request: replays stored response
  test("replays the stored response for a completed key", async () => {
    const completedRecord = makeRecord({
      status: "COMPLETED",
      responseStatus: 201,
      responseBody: {
        success: true,
        message: "Order created successfully",
        data: { id: "order-123", orderNumber: "ORD-2026-ABC" },
      },
    });

    mockPrisma.$executeRawUnsafe.mockResolvedValue(0);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([completedRecord]);

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Should NOT call next (handler is skipped)
    expect(next).not.toHaveBeenCalled();

    // Should replay the original response
    expect(res.statusCode).toBe(201);
    expect(res._body).toEqual(completedRecord.responseBody);
  });

  // Test 4 — Same key, different payload → 409 Conflict
  test("returns 409 when the same key is used with a different payload", async () => {
    const existingRecord = makeRecord({
      requestHash: bodyHash({ amount: 1000 }), // original was { addressId: "addr-123" }
    });

    mockPrisma.$executeRawUnsafe.mockResolvedValue(0);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([existingRecord]);

    const req = makeReq(); // body is { addressId: "addr-123" } → different hash
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: expect.stringContaining("different request payload"),
      }),
    );
  });

  // Test 3 — Concurrent request: returns 409 when another request is processing
  test("returns 409 when the key is currently being processed by another request", async () => {
    // Record was just created by another request 5 seconds ago (still fresh)
    const processingRecord = makeRecord({
      status: "PROCESSING",
      updatedAt: new Date(Date.now() - 5000),
    });

    mockPrisma.$executeRawUnsafe.mockResolvedValue(0);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([processingRecord]);

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: expect.stringContaining("currently being processed"),
      }),
    );
  });

  // Test 6 — Server crash recovery: reclaims stale PROCESSING record
  test("reclaims a stale PROCESSING record after lock timeout", async () => {
    // Record is old enough to be considered abandoned (server crashed)
    const staleRecord = makeRecord({
      status: "PROCESSING",
      updatedAt: new Date(Date.now() - LOCK_TIMEOUT_MS - 5000),
    });

    mockPrisma.$executeRawUnsafe
      .mockResolvedValueOnce(0) // Initial INSERT (conflict)
      .mockResolvedValueOnce(1); // Reclaim UPDATE succeeds
    mockPrisma.$queryRawUnsafe.mockResolvedValue([staleRecord]);

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Should have attempted to reclaim
    expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledTimes(2);

    // The second call should be the reclaim UPDATE
    const reclaimCall = mockPrisma.$executeRawUnsafe.mock.calls[1];
    expect(reclaimCall[0]).toContain("UPDATE");
    expect(reclaimCall[0]).toContain("PROCESSING");

    // Should proceed to the handler
    expect(next).toHaveBeenCalledWith();
  });

  test("returns 409 when reclaim of stale record fails (another retry won)", async () => {
    const staleRecord = makeRecord({
      status: "PROCESSING",
      updatedAt: new Date(Date.now() - LOCK_TIMEOUT_MS - 5000),
    });

    mockPrisma.$executeRawUnsafe
      .mockResolvedValueOnce(0)  // Initial INSERT (conflict)
      .mockResolvedValueOnce(0); // Reclaim UPDATE fails (another retry won)
    mockPrisma.$queryRawUnsafe.mockResolvedValue([staleRecord]);

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: expect.stringContaining("currently being processed"),
      }),
    );
  });

  // Test: FAILED record allows retry
  test("retries after a previously FAILED attempt by deleting and re-claiming", async () => {
    const failedRecord = makeRecord({ status: "FAILED" });
    const freshRecord = makeRecord({ status: "PROCESSING" });

    mockPrisma.$executeRawUnsafe
      .mockResolvedValueOnce(0)  // First INSERT (conflict — old record exists)
      .mockResolvedValueOnce(1); // Second INSERT (after delete, success)
    mockPrisma.$queryRawUnsafe
      .mockResolvedValueOnce([failedRecord])  // First SELECT finds FAILED
      .mockResolvedValueOnce([freshRecord]);  // Second SELECT finds new PROCESSING
    mockPrisma.idempotencyKey.deleteMany.mockResolvedValue({ count: 1 });

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Should have deleted the failed record
    expect(mockPrisma.idempotencyKey.deleteMany).toHaveBeenCalledWith({
      where: { id: RECORD_ID, status: "FAILED" },
    });

    // Should proceed to handler
    expect(next).toHaveBeenCalledWith();
  });

  // Test: Response capture persists the response
  test("captures response via res.json and stores it as COMPLETED", async () => {
    const freshRecord = makeRecord();

    mockPrisma.$executeRawUnsafe.mockResolvedValue(1);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([freshRecord]);
    mockPrisma.idempotencyKey.update.mockResolvedValue({});

    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // Simulate the controller calling res.status(201).json(...)
    res.status(201);
    res.json({ success: true, data: { id: "order-1" } });

    // Wait for the async persistence
    await new Promise((r) => setTimeout(r, 50));

    expect(mockPrisma.idempotencyKey.update).toHaveBeenCalledWith({
      where: { id: RECORD_ID },
      data: {
        status: "COMPLETED",
        responseStatus: 201,
        responseBody: { success: true, data: { id: "order-1" } },
      },
    });
  });

  // Test 8 — Different users: same key, different users are independent
  test("different users can use the same idempotency key independently", async () => {
    // User A's request creates a new record
    const userARecord = makeRecord({ userId: USER_ID });

    mockPrisma.$executeRawUnsafe.mockResolvedValue(1);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([userARecord]);

    const reqA = makeReq({ user: { id: USER_ID } });
    const resA = makeRes();
    const nextA = jest.fn();

    await middleware(reqA, resA, nextA);
    expect(nextA).toHaveBeenCalledWith();

    // User B's request with the same key creates a DIFFERENT record
    jest.clearAllMocks();
    const userBRecord = makeRecord({
      id: "b-record-id",
      userId: OTHER_USER_ID,
    });

    mockPrisma.$executeRawUnsafe.mockResolvedValue(1);
    mockPrisma.$queryRawUnsafe.mockResolvedValue([userBRecord]);

    const reqB = makeReq({ user: { id: OTHER_USER_ID } });
    const resB = makeRes();
    const nextB = jest.fn();

    await middleware(reqB, resB, nextB);
    expect(nextB).toHaveBeenCalledWith();

    // The INSERT call should use the respective user IDs
    expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT"),
      IDEM_KEY,
      OTHER_USER_ID,
      expect.any(String),
      expect.any(String),
      expect.any(Date),
    );
  });
});

// Test 7 — TTL / expiration
describe("idempotency cleanup", () => {
  // Reset module cache so we get fresh mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("pruneExpiredIdempotencyKeys deletes records past expiry + grace", async () => {
    mockPrisma.idempotencyKey.deleteMany.mockResolvedValue({ count: 5 });

    const { pruneExpiredIdempotencyKeys } = require("../src/lib/idempotencyCleanup");
    const count = await pruneExpiredIdempotencyKeys();

    expect(count).toBe(5);
    expect(mockPrisma.idempotencyKey.deleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: { lt: expect.any(Date) },
      },
    });
  });

  test("pruneExpiredIdempotencyKeys returns 0 when nothing to prune", async () => {
    mockPrisma.idempotencyKey.deleteMany.mockResolvedValue({ count: 0 });

    const { pruneExpiredIdempotencyKeys } = require("../src/lib/idempotencyCleanup");
    const count = await pruneExpiredIdempotencyKeys();

    expect(count).toBe(0);
  });
});
