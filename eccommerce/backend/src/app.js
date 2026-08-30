const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const env = require("./config/env");
const logger = require("./lib/logger");
const requestId = require("./middleware/requestId");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { mountDocs } = require("./docs");

const app = express();

// Neon and most hosts sit behind a proxy. Without this, every request looks
// like it came from the proxy's IP and rate limiting would throttle all
// users as if they were one person.
app.set("trust proxy", 1);

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
          "http://localhost:5000",
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

// gzip/deflate. Product listings are the largest responses this API serves
// and compress to roughly a fifth of their size.
app.use(compression());

app.use(requestId);

// Structured request logging, correlated by the id assigned above.
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    // Default pino-http logs every 2xx at "info", which buries real signal
    // in health-check noise. Successful requests are debug; problems are not.
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      if (req.url === "/api/health") return "silent";
      return "debug";
    },
  }),
);

// Only allow the frontend origin. Reflecting any origin back would let any
// website on the internet make authenticated requests on a user's behalf.
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// The refresh token travels as an httpOnly cookie, so the parser must run
// before any route that reads it.
app.use(cookieParser());

// 100kb cap. The default is 100kb too, but stating it makes the intent
// explicit: no endpoint here should ever receive a large JSON body.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

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

// Broad safety net. Auth routes add their own much stricter limits.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    // Health checks come from the platform on a fixed schedule and would
    // otherwise eat a meaningful slice of the budget for that IP.
    skip: (req) => req.path === "/health",
    message: {
      success: false,
      message: "Too many requests, please slow down.",
    },
  }),
);

// Google's OAuth redirect URI is registered as /auth/google/callback in the
// Cloud Console, but the main API routes live under /api. This bridge route
// handles the redirect at the registered path using the same controller logic.
const oauthController = require("./modules/auth/oauth.controller");
app.get("/auth/google/callback", (req, res, next) => {
  req.params.provider = "google";
  req.oauthProvider = "google";
  next();
}, oauthController.callback);

app.use("/api", routes);

// Swagger UI at /docs, served from the OpenAPI spec.
mountDocs(app);

// These two must stay last, and in this order.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
