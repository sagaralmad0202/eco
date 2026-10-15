const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { cacheEventEmitter, cacheInspector } = require("../../lib/cache");

/**
 * Live Redis Monitoring Controller
 *
 * Exposes real-time telemetry, SCAN-based key inspection, historical metrics,
 * and audited cache management actions for system administrators.
 */

/**
 * GET /api/admin/redis/overview
 * Live high-level status, counters, memory stats, and Redis server information
 */
const getOverview = asyncHandler(async (req, res) => {
  const metrics = await cacheInspector.getOverviewMetrics();
  res.json({ success: true, data: metrics });
});

/**
 * GET /api/admin/redis/events
 * Real-time Server-Sent Events (SSE) stream of live cache operations
 */
const streamEvents = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // Send initial handshake
  res.write(
    `event: connected\ndata: ${JSON.stringify({
      message: "Connected to Redis live activity feed",
      timestamp: new Date().toISOString(),
    })}\n\n`,
  );

  cacheEventEmitter.addSseClient(res);
};

/**
 * GET /api/admin/redis/events/recent
 * Returns bounded history of recent cache operations
 */
const getRecentEvents = asyncHandler(async (req, res) => {
  const { limit = 100, type, keyPattern } = req.query;
  const events = cacheEventEmitter.getRecentEvents({
    limit: Math.min(200, Math.max(1, Number(limit) || 100)),
    type: type || null,
    keyPattern: keyPattern || null,
  });

  res.json({
    success: true,
    count: events.length,
    data: events,
  });
});

/**
 * GET /api/admin/redis/keys
 * SCAN-based incremental key discovery with pagination
 */
const getKeys = asyncHandler(async (req, res) => {
  const { pattern = "cache:*", cursor = "0", limit = 25, type } = req.query;

  const result = await cacheInspector.scanKeys({
    pattern: String(pattern).trim(),
    cursor: String(cursor).trim(),
    limit: Math.min(100, Math.max(5, Number(limit) || 25)),
    typeFilter: type ? String(type).trim() : null,
  });

  res.json({ success: true, ...result });
});

/**
 * GET /api/admin/redis/keys/:key
 * Deep inspection of a single Redis key and its structure
 */
const inspectKey = asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!key) {
    throw ApiError.badRequest("Key parameter is required");
  }

  const result = await cacheInspector.inspectKey(key);
  if (!result.found && result.error) {
    throw ApiError.badRequest(result.error);
  }

  res.json({ success: true, data: result });
});

/**
 * GET /api/admin/redis/lifecycle/:key
 * Retrieve recorded cache lifecycle timeline for a specific key
 */
const getKeyLifecycle = asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!key) {
    throw ApiError.badRequest("Key parameter is required");
  }

  const history = cacheEventEmitter.getKeyLifecycle(key);
  const currentKeyInfo = await cacheInspector.inspectKey(key);

  res.json({
    success: true,
    data: {
      key,
      isCurrentlyCached: currentKeyInfo.found,
      currentTtl: currentKeyInfo.ttl,
      type: currentKeyInfo.type,
      history,
    },
  });
});

/**
 * GET /api/admin/redis/analytics
 * Bounded historical time-series analytics (hits, misses, hit ratio, latency, throughput)
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { range = "1h" } = req.query;
  const validRanges = ["5m", "15m", "1h"];
  const selectedRange = validRanges.includes(range) ? range : "1h";

  const timeSeries = cacheEventEmitter.getTimeSeriesMetrics(selectedRange);
  const overview = await cacheInspector.getOverviewMetrics();

  res.json({
    success: true,
    data: {
      range: selectedRange,
      overview: overview.cache,
      memory: overview.memory,
      timeSeries,
    },
  });
});

/**
 * POST /api/admin/redis/keys/delete
 * Delete an individual cache key with administrative auditing
 */
const deleteKey = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== "string") {
    throw ApiError.badRequest("Valid key name is required");
  }

  const audit = {
    userId: req.user?.id,
    email: req.user?.email || "admin",
    ip: req.ip,
  };

  const result = await cacheInspector.deleteKey(key, audit);
  res.json({ success: true, ...result });
});

/**
 * POST /api/admin/redis/keys/invalidate
 * Safely invalidate keys matching an approved pattern with administrative auditing
 */
const invalidatePattern = asyncHandler(async (req, res) => {
  const { pattern } = req.body;
  if (!pattern || typeof pattern !== "string") {
    throw ApiError.badRequest("Valid pattern is required");
  }

  const audit = {
    userId: req.user?.id,
    email: req.user?.email || "admin",
    ip: req.ip,
  };

  try {
    const result = await cacheInspector.invalidatePattern(pattern, audit);
    res.json({ success: true, ...result });
  } catch (err) {
    throw ApiError.badRequest(err.message);
  }
});

module.exports = {
  getOverview,
  streamEvents,
  getRecentEvents,
  getKeys,
  inspectKey,
  getKeyLifecycle,
  getAnalytics,
  deleteKey,
  invalidatePattern,
};
