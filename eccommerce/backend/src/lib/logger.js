// Structured JSON logging.
//
// console.log is fine until the day you need to answer "what happened to
// order ORD-2026-000148?" across a week of logs. JSON lines are greppable by
// field and ingestible by Datadog/Loki/CloudWatch without a custom parser.
//
// In development the output is piped through pino-pretty for human eyes;
// in production it stays raw JSON so the log shipper can index it.

const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.LOG_LEVEL,

  // Anything listed here is replaced with [Redacted] before it is written.
  // Passwords and tokens end up in log lines by accident far more often than
  // anyone expects — usually via a whole-request-body dump added while
  // debugging and never removed.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.newPassword",
      "*.currentPassword",
      "*.passwordHash",
      "*.token",
      "*.refreshToken",
      "*.accessToken",
      "*.tokenHash",
      "*.razorpay_signature",
    ],
    censor: "[Redacted]",
  },

  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

module.exports = logger;
