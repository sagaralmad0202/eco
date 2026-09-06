const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const pinoHttp = require("pino-http");

const env = require("../config/env");
const logger = require("../lib/logger");
const requestId = require("../middleware/requestId");
const GATEWAY_CONFIG = require("./gateway.config");
const { createCoreProxy } = require("./middleware/proxy");
const { gatewayHealthHandler } = require("./middleware/gatewayHealth");

const gatewayApp = express();

// Trust reverse proxies / load balancers in front of the gateway if configured
gatewayApp.set(
  "trust proxy",
  env.TRUST_PROXY === "false"
    ? false
    : env.TRUST_PROXY.split(",").map((entry) => entry.trim()),
);

// Do not advertise the framework
gatewayApp.disable("x-powered-by");

// Apply edge security headers
gatewayApp.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://checkout.razorpay.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          `http://localhost:${GATEWAY_CONFIG.port}`,
          "ws://localhost:5173",
          "https://api.razorpay.com",
        ],
        frameSrc: ["'self'", "https://api.razorpay.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

// Compress responses at gateway boundary
gatewayApp.use(compression());

// Assign / preserve unique request ID at the edge
gatewayApp.use(requestId);

// Timestamp start of request for gateway latency calculations
gatewayApp.use((req, res, next) => {
  req._gatewayStartTime = Date.now();
  next();
});

// Structured request logging at the Gateway
gatewayApp.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      if (req.url === "/gateway/health" || req.url === "/api/health") return "silent";
      return "debug";
    },
  }),
);

// CORS at Gateway boundary: allow frontend web & mobile access
gatewayApp.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = GATEWAY_CONFIG.clientOrigin
        .split(",")
        .map((o) => o.trim());
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Gateway CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parsing with streaming re-hydration for upstream proxies
gatewayApp.use(express.json({ limit: "10mb" }));
gatewayApp.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Gateway Health Check (probes gateway and upstream core service)
gatewayApp.get("/gateway/health", gatewayHealthHandler);

// Gateway route catalog / overview endpoint for inspection
gatewayApp.get("/gateway/routes", (req, res) => {
  res.json({
    success: true,
    gatewayPort: GATEWAY_CONFIG.port,
    upstreamUrl: GATEWAY_CONFIG.coreServiceUrl,
    routes: GATEWAY_CONFIG.routes,
  });
});

// Core reverse proxy handler
const coreProxy = createCoreProxy();

// Register gateway proxy dispatcher: preserves full upstream path (/api, /media, /docs, etc.)
gatewayApp.use((req, res, next) => {
  const isProxyRoute = GATEWAY_CONFIG.routes.some((route) => {
    return req.path === route.prefix || req.path.startsWith(route.prefix + "/");
  });

  if (isProxyRoute) {
    return coreProxy(req, res, next);
  }
  next();
});

// Fallback for unmatched routes that don't match any gateway proxy route
gatewayApp.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Gateway route not found: ${req.method} ${req.originalUrl}`,
      requestId: req.id,
    },
  });
});

// Gateway-level error handler
// eslint-disable-next-line no-unused-vars
gatewayApp.use((err, req, res, next) => {
  logger.error({ err, path: req.originalUrl, id: req.id }, "Unhandled Gateway error");
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_GATEWAY_ERROR",
        message: err.message || "An unexpected error occurred in the API Gateway",
        requestId: req.id,
      },
    });
  }
});

module.exports = gatewayApp;
