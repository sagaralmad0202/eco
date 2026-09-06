const gatewayApp = require("./gateway.app");
const GATEWAY_CONFIG = require("./gateway.config");
const env = require("../config/env");
const logger = require("../lib/logger");

function startGateway() {
  const port = GATEWAY_CONFIG.port;

  const server = gatewayApp.listen(port, () => {
    logger.info(
      {
        gatewayPort: port,
        upstreamCore: GATEWAY_CONFIG.coreServiceUrl,
        env: env.NODE_ENV,
        health: `http://localhost:${port}/gateway/health`,
        routes: `http://localhost:${port}/gateway/routes`,
      },
      `API Gateway listening on http://localhost:${port}`,
    );
  });

  server.headersTimeout = 65000;
  server.requestTimeout = 60000;

  let shuttingDown = false;

  async function shutdown(signal, code = 0) {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "API Gateway shutting down");

    const forceExit = setTimeout(() => {
      logger.error("Forced Gateway shutdown after 10s timeout");
      process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close(() => {
      clearTimeout(forceExit);
      logger.info("API Gateway closed cleanly");
      process.exit(code);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "Unhandled promise rejection in API Gateway");
    shutdown("unhandledRejection", 1);
  });

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception in API Gateway");
    shutdown("uncaughtException", 1);
  });

  return server;
}

if (require.main === module) {
  startGateway();
}

module.exports = {
  startGateway,
};
