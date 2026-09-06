const GATEWAY_CONFIG = require("../gateway.config");

/**
 * Health check handler for the API Gateway.
 * Probes the Gateway itself and queries the upstream core backend service health.
 */
async function gatewayHealthHandler(req, res) {
  const gatewayInfo = {
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(
      process.memoryUsage().rss / (1024 * 1024) * 100,
    ) / 100,
    timestamp: new Date().toISOString(),
    proxyTarget: GATEWAY_CONFIG.coreServiceUrl,
  };

  let upstreamHealth = {
    status: "unknown",
    reachable: false,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const targetUrl = `${GATEWAY_CONFIG.coreServiceUrl}/api/health`;
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "X-Request-Id": req.id || "gateway-health-probe" },
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => null);
    upstreamHealth = {
      status: response.ok ? "healthy" : "unhealthy",
      statusCode: response.status,
      reachable: true,
      data,
    };
  } catch (err) {
    upstreamHealth = {
      status: "unreachable",
      reachable: false,
      error: err.name === "AbortError" ? "Probe timed out (3s)" : err.message,
    };
  }

  const isHealthy = upstreamHealth.reachable && upstreamHealth.status === "healthy";

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    gateway: "active",
    status: isHealthy ? "healthy" : "degraded",
    info: gatewayInfo,
    upstream: upstreamHealth,
  });
}

module.exports = {
  gatewayHealthHandler,
};
