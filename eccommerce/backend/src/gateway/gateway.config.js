const env = require("../config/env");

const GATEWAY_CONFIG = {
  port: Number(process.env.GATEWAY_PORT || env.GATEWAY_PORT || 5000),
  coreServiceUrl:
    process.env.UPSTREAM_CORE_URL ||
    env.UPSTREAM_CORE_URL ||
    "http://127.0.0.1:5001",
  clientOrigin: env.CLIENT_ORIGIN || "http://localhost:3000",
  proxyTimeoutMs: 30000,
  routes: [
    {
      prefix: "/api",
      targetPath: "/api",
      description: "Core REST API endpoints",
    },
    {
      prefix: "/media",
      targetPath: "/media",
      description: "Static media and assets",
    },
    {
      prefix: "/docs",
      targetPath: "/docs",
      description: "Swagger / OpenAPI documentation UI",
    },
    {
      prefix: "/auth/google/callback",
      targetPath: "/auth/google/callback",
      description: "OAuth Google callback bridge",
    },
  ],
};

module.exports = GATEWAY_CONFIG;
