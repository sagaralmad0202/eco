const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");

const env = require("./config/env");
const logger = require("./lib/logger");
const requestId = require("./middleware/requestId");
const { createRateLimiterMiddleware } = require("./middleware/rateLimiter");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { mountDocs } = require("./docs");

const app = express();

// Configure actual proxy addresses in deployments. Direct clients must not be
// able to select their rate-limit identity with X-Forwarded-For.
app.set(
  "trust proxy",
  env.TRUST_PROXY === "false"
    ? false
    : env.TRUST_PROXY.split(",").map((entry) => entry.trim()),
);

// Do not advertise the framework. It is one less hint for an attacker
// fingerprinting which CVEs might apply.
app.disable("x-powered-by");

// Security headers (clickjacking, MIME sniffing, XSS filtering, CSP policies).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
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
          "http://localhost:5000",
          "ws://localhost:5173",
          "https://api.razorpay.com",
        ],
        frameSrc: ["'self'", "https://api.razorpay.com"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

// gzip/deflate. Product listings are the largest responses this API serves
// and compress to roughly a fifth of their size.
app.use(compression());

app.use(requestId);

// Structured request logging, correlated by the id assigned above.
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    customLogLevel(req, res, err) {
      if (req.rateLimitHandled) return "silent";
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      if (req.url === "/api/health") return "silent";
      return "debug";
    },
  }),
);

const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const allowedOriginsList = new Set([
  ...env.CLIENT_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, "")),
  ...(env.NODE_ENV === "development" ? devOrigins : []),
]);

// CORS configuration: only allow designated frontend origins with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOriginsList.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Cookie parser for HttpOnly session/refresh credentials
app.use(cookieParser());

// 100kb cap for standard JSON bodies
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Anti-CSRF protection on state-changing requests
const csrfProtection = require("./middleware/csrf");
app.use(csrfProtection);

// Product assets are owned by the backend catalogue. A stable /media URL
// keeps product, cart, wishlist and immutable order snapshots consistent.
app.use(
  "/media",
  express.static(path.resolve(__dirname, "../public"), {
    immutable: true,
    maxAge: "1y",
    setHeaders(res) {
      // The storefront commonly runs on a separate origin (5173 -> 5000).
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Google's OAuth redirect URI is registered as /auth/google/callback in the
// Cloud Console, but the main API routes live under /api. This bridge route
// handles the redirect at the registered path using the same controller logic.
const oauthController = require("./modules/auth/oauth.controller");
app.get(
  "/auth/google/callback",
  createRateLimiterMiddleware({
    method: "GET",
    route: "/auth/google/callback",
  }),
  (req, res, next) => {
    req.params.provider = "google";
    req.oauthProvider = "google";
    next();
  },
  oauthController.callback,
);

app.use("/api", routes);

// Swagger UI at /docs, served from the OpenAPI spec.
mountDocs(app);

// These two must stay last, and in this order.
// Arbitrary unknown paths share one bounded counter rather than creating keys.
app.use(createRateLimiterMiddleware({ route: "unmatched" }));
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
