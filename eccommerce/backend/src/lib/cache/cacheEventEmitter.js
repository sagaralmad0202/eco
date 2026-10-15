const { EventEmitter } = require("events");
const logger = require("../logger");

/**
 * High-performance, non-blocking cache event telemetry and streaming subsystem.
 *
 * Design Principles:
 * 1. ZERO IMPACT: Monitoring failures never throw into or block user requests.
 * 2. BOUNDED BUFFER: Uses a circular ring buffer to prevent unbounded memory growth.
 * 3. REAL-TIME SSE: Broadcasts live cache events to connected monitoring dashboards.
 * 4. TIME-SERIES AGGREGATION: Maintains rolling 1-minute historical metric buckets for 60m.
 * 5. SAFE REDACTION: Automatically scrubs sensitive data from logged keys and values.
 */

const MAX_EVENT_BUFFER_SIZE = 500;
const MAX_TIME_SERIES_BUCKETS = 60; // 60 minutes of 1-minute buckets
const SENSITIVE_KEYS_REGEX = /(?:password|secret|token|hash|auth|credit|card|cvv|api[_-]?key)/i;

class CacheEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);

    // Circular ring buffer for recent events
    this.eventBuffer = [];
    this.nextEventId = 1;

    // Rolling 1-minute buckets for historical metrics
    this.timeSeriesBuckets = new Map();

    // Active SSE client response handles
    this.sseClients = new Set();

    // Key-specific lifecycle event history: Map<key, Array<event>>
    this.keyLifecycles = new Map();
    this.maxKeyLifecycleHistory = 20;

    // Heartbeat timer for connected SSE clients
    this.heartbeatInterval = setInterval(() => this._sendHeartbeat(), 15000);
    if (this.heartbeatInterval.unref) {
      this.heartbeatInterval.unref();
    }

    // Bucket cleanup interval (every 5 minutes)
    this.cleanupInterval = setInterval(() => this._cleanupOldBuckets(), 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Safely sanitize and redact sensitive fields from objects or JSON strings
   */
  redactValue(val) {
    if (val === null || val === undefined) return null;
    if (typeof val !== "object") {
      if (typeof val === "string" && val.length > 500) {
        return val.slice(0, 500) + "... [truncated]";
      }
      return val;
    }

    if (Array.isArray(val)) {
      if (val.length > 20) {
        return [
          ...val.slice(0, 20).map((item) => this.redactValue(item)),
          `... [${val.length - 20} more items]`,
        ];
      }
      return val.map((item) => this.redactValue(item));
    }

    const clean = {};
    for (const [k, v] of Object.entries(val)) {
      if (SENSITIVE_KEYS_REGEX.test(k)) {
        clean[k] = "[REDACTED]";
      } else if (typeof v === "object" && v !== null) {
        clean[k] = this.redactValue(v);
      } else if (typeof v === "string" && v.length > 500) {
        clean[k] = v.slice(0, 500) + "... [truncated]";
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  /**
   * Record a cache event and broadcast to listeners and SSE clients
   *
   * @param {Object} event
   * @param {string} event.type - CACHE_HIT | CACHE_MISS | CACHE_SET | CACHE_DELETE | CACHE_INVALIDATE | CACHE_ERROR
   * @param {string} event.key - Cache key or pattern
   * @param {number} [event.ttl] - TTL in seconds
   * @param {number} [event.durationMs] - Operation latency in milliseconds
   * @param {string} [event.source] - "cache" | "database"
   * @param {string} [event.caller] - Calling function or route context
   * @param {string} [event.correlationId] - Correlation / Request ID
   * @param {any} [event.valuePreview] - Raw value to be safely redacted for preview
   * @param {number} [event.count] - For batch invalidations, number of keys affected
   */
  recordEvent(eventData) {
    try {
      const now = Date.now();
      const event = {
        id: this.nextEventId++,
        timestamp: new Date(now).toISOString(),
        epochMs: now,
        type: eventData.type,
        key: eventData.key || "unknown",
        ttl: eventData.ttl ?? null,
        durationMs: typeof eventData.durationMs === "number" ? Math.round(eventData.durationMs * 100) / 100 : 0,
        source: eventData.source || (eventData.type === "CACHE_HIT" ? "cache" : "database"),
        caller: eventData.caller || null,
        correlationId: eventData.correlationId || null,
        count: eventData.count ?? 1,
        valuePreview: eventData.valuePreview !== undefined ? this.redactValue(eventData.valuePreview) : null,
        details: eventData.details || null,
      };

      // 1. Maintain bounded circular event buffer
      this.eventBuffer.push(event);
      if (this.eventBuffer.length > MAX_EVENT_BUFFER_SIZE) {
        this.eventBuffer.shift();
      }

      // 2. Track per-key lifecycle history
      if (event.key && !event.key.includes("*")) {
        let history = this.keyLifecycles.get(event.key);
        if (!history) {
          history = [];
          this.keyLifecycles.set(event.key, history);
        }
        history.push(event);
        if (history.length > this.maxKeyLifecycleHistory) {
          history.shift();
        }
      }

      // 3. Record in rolling time-series aggregate buckets
      this._recordTimeSeriesMetric(event, now);

      // 4. Emit internal event
      this.emit("cacheEvent", event);

      // 5. Broadcast to connected SSE dashboards
      this._broadcastToSse(event);
    } catch (err) {
      // Fail-safe: telemetry errors must never disrupt business operations
      logger.debug({ err: err.message }, "Error in cache event telemetry recording");
    }
  }

  /**
   * Aggregate events into 1-minute time buckets for historical analytics charts
   */
  _recordTimeSeriesMetric(event, now) {
    const bucketKey = Math.floor(now / 60000) * 60000; // Floor to minute
    let bucket = this.timeSeriesBuckets.get(bucketKey);
    if (!bucket) {
      bucket = {
        timestamp: new Date(bucketKey).toISOString(),
        epochMs: bucketKey,
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        totalLatencies: 0,
        latencySamples: 0,
      };
      this.timeSeriesBuckets.set(bucketKey, bucket);
    }

    switch (event.type) {
      case "CACHE_HIT":
        bucket.hits++;
        break;
      case "CACHE_MISS":
        bucket.misses++;
        break;
      case "CACHE_SET":
        bucket.sets++;
        break;
      case "CACHE_DELETE":
      case "CACHE_INVALIDATE":
        bucket.deletes += event.count || 1;
        break;
      case "CACHE_ERROR":
        bucket.errors++;
        break;
    }

    if (typeof event.durationMs === "number" && event.durationMs > 0) {
      bucket.totalLatencies += event.durationMs;
      bucket.latencySamples++;
    }
  }

  /**
   * Prune buckets older than MAX_TIME_SERIES_BUCKETS (60 mins)
   */
  _cleanupOldBuckets() {
    const cutoff = Date.now() - MAX_TIME_SERIES_BUCKETS * 60 * 1000;
    for (const [key] of this.timeSeriesBuckets) {
      if (key < cutoff) {
        this.timeSeriesBuckets.delete(key);
      }
    }

    // Also prune stale key lifecycles if Map exceeds 1,000 keys
    if (this.keyLifecycles.size > 1000) {
      const keysToDelete = Array.from(this.keyLifecycles.keys()).slice(0, 200);
      for (const k of keysToDelete) {
        this.keyLifecycles.delete(k);
      }
    }
  }

  /**
   * Add an active SSE client
   */
  addSseClient(res) {
    this.sseClients.add(res);

    // Replay recent buffered events so dashboard loads immediately with context
    const recent = this.eventBuffer.slice(-50);
    for (const evt of recent) {
      res.write(`data: ${JSON.stringify(evt)}\n\n`);
    }

    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  /**
   * Broadcast an event to all connected SSE clients
   */
  _broadcastToSse(event) {
    if (this.sseClients.size === 0) return;
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Send heartbeat comment to keep SSE connections alive through proxies and firewalls
   */
  _sendHeartbeat() {
    if (this.sseClients.size === 0) return;
    const heartbeat = `: ping ${Date.now()}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(heartbeat);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Get recent events with optional limit and filtering
   */
  getRecentEvents(options = {}) {
    const { limit = 100, type = null, keyPattern = null } = options;
    let events = [...this.eventBuffer];

    if (type) {
      events = events.filter((e) => e.type === type);
    }

    if (keyPattern) {
      const reg = new RegExp(keyPattern.replace(/\*/g, ".*"), "i");
      events = events.filter((e) => reg.test(e.key));
    }

    return events.slice(-limit);
  }

  /**
   * Get recorded lifecycle sequence for a specific key
   */
  getKeyLifecycle(key) {
    return this.keyLifecycles.get(key) || [];
  }

  /**
   * Get formatted time-series analytics for dashboard charts
   *
   * @param {string} range - "5m" | "15m" | "1h"
   */
  getTimeSeriesMetrics(range = "1h") {
    let minutes = 60;
    if (range === "5m") minutes = 5;
    else if (range === "15m") minutes = 15;

    const now = Date.now();
    const startTime = Math.floor((now - minutes * 60 * 1000) / 60000) * 60000;
    const points = [];

    for (let t = startTime; t <= now; t += 60000) {
      const bucket = this.timeSeriesBuckets.get(t);
      const totalOps = bucket ? bucket.hits + bucket.misses : 0;
      const hitRatio = totalOps > 0 ? Number(((bucket.hits / totalOps) * 100).toFixed(1)) : 0;
      const avgLatency =
        bucket && bucket.latencySamples > 0
          ? Number((bucket.totalLatencies / bucket.latencySamples).toFixed(2))
          : 0;

      points.push({
        time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        epochMs: t,
        hits: bucket?.hits || 0,
        misses: bucket?.misses || 0,
        sets: bucket?.sets || 0,
        deletes: bucket?.deletes || 0,
        errors: bucket?.errors || 0,
        hitRatio,
        avgLatencyMs: avgLatency,
      });
    }

    return points;
  }

  /**
   * Reset for automated test teardown
   */
  resetForTesting() {
    this.eventBuffer = [];
    this.timeSeriesBuckets.clear();
    this.keyLifecycles.clear();
    this.nextEventId = 1;
  }
}

// Singleton instance
const cacheEventEmitter = new CacheEventEmitter();

module.exports = cacheEventEmitter;
