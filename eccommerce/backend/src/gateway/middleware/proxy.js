const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const logger = require("../../lib/logger");
const GATEWAY_CONFIG = require("../gateway.config");

/**
 * Creates a reverse-proxy middleware pointing to the upstream service.
 *
 * Handles:
 * - Request ID propagation (X-Request-Id)
 * - Gateway latency measurement (X-Gateway-Response-Time)
 * - Request body stream re-writing (fixRequestBody for parsed JSON/URL-encoded payloads)
 * - Structured 502/504 Bad Gateway / Gateway Timeout JSON error responses
 *
 * @param {Object} [options]
 * @param {string} [options.target] Upstream target URL (defaults to GATEWAY_CONFIG.coreServiceUrl)
 * @param {number} [options.timeout] Proxy timeout in ms
 * @returns {Function} Express middleware
 */
function createCoreProxy(options = {}) {
  const target = options.target || GATEWAY_CONFIG.coreServiceUrl;
  const proxyTimeout = options.timeout || GATEWAY_CONFIG.proxyTimeoutMs;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    timeout: proxyTimeout,
    proxyTimeout,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Propagate the unique request ID assigned at the gateway boundary
        if (req.id) {
          proxyReq.setHeader("X-Request-Id", req.id);
        }

        // Attach gateway telemetry headers
        proxyReq.setHeader("X-Gateway-Timestamp", new Date().toISOString());

        // Re-stream request body if it was parsed by express.json() / urlencoded
        if (req.body) {
          fixRequestBody(proxyReq, req);
        }
      },
      proxyRes: (proxyRes, req, res) => {
        // Record latency through the gateway
        const startTime = req._gatewayStartTime || Date.now();
        const duration = Date.now() - startTime;
        res.setHeader("X-Gateway-Response-Time", `${duration}ms`);

        if (req.id) {
          res.setHeader("X-Request-Id", req.id);
        }
      },
      error: (err, req, res) => {
        logger.error(
          {
            err: err.message,
            code: err.code,
            path: req.originalUrl,
            requestId: req.id,
          },
          "Gateway proxy error to upstream",
        );

        if (!res.headersSent) {
          const isTimeout =
            err.code === "ECONNRESET" ||
            err.code === "ETIMEDOUT" ||
            err.code === "ESOCKETTIMEDOUT" ||
            (typeof err.message === "string" &&
              err.message.toLowerCase().includes("timeout"));

          const status = isTimeout ? 504 : 502;
          const code = isTimeout ? "GATEWAY_TIMEOUT" : "BAD_GATEWAY";
          const message = isTimeout
            ? "Upstream service timed out processing request"
            : "Upstream service is currently unreachable or restarting";

          res.status(status).json({
            success: false,
            error: {
              code,
              message,
              path: req.originalUrl,
              requestId: req.id || null,
            },
          });
        }
      },
    },
  });
}

module.exports = {
  createCoreProxy,
};
