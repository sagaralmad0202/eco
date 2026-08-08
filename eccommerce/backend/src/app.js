const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Neon and most hosts sit behind a proxy. Without this, every request looks
// like it came from the proxy's IP and rate limiting would throttle all
// users as if they were one person.
app.set("trust proxy", 1);

// Security headers (clickjacking, MIME sniffing, and related protections).
app.use(helmet());

// Only allow the frontend origin. Reflecting any origin back would let any
// website on the internet make authenticated requests on a user's behalf.
app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  })
);

// 100kb cap. The default is 100kb too, but stating it makes the intent
// explicit: no endpoint here should ever receive a large JSON body.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Broad safety net. Auth routes add their own much stricter limits.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please slow down." },
  })
);

// Minimal request log. Swap for pino/winston when you need structured logs.
if (env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`
      );
    });
    next();
  });
}

app.use("/api", routes);

// These two must stay last, and in this order.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
