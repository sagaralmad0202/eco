const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");
const logger = require("./lib/logger");
const { closeRedis, initializeRedis } = require("./lib/redis");
const { startTokenCleanup } = require("./lib/tokenCleanup");
const { startReservationSweeper } = require("./lib/reservationSweep");

async function start() {
  // Connect before accepting traffic, so a bad DATABASE_URL fails loudly
  // here instead of on a customer's first request.
  // Neon Serverless compute may take several seconds to resume from idle, so we retry.
  const MAX_DB_RETRIES = 5;
  const RETRY_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        logger.info(`Connecting to database (attempt ${attempt}/${MAX_DB_RETRIES} - resuming compute)...`);
      }
      await prisma.$connect();
      logger.info("Database connected");
      break;
    } catch (err) {
      if (attempt === MAX_DB_RETRIES) {
        logger.fatal(
          { err },
          "Could not connect to the database. Check DATABASE_URL in your .env file.",
        );
        process.exit(1);
      }
      logger.warn(
        `Database connection attempt ${attempt}/${MAX_DB_RETRIES} failed (${err.message ? err.message.split("\n")[0] : "connection error"}). Retrying in ${RETRY_DELAY_MS / 1000}s...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // A bounded startup attempt avoids the first customer's request opening Redis.
  // The server can serve reads during an outage; sensitive routes return 503.
  await initializeRedis();
  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        docs: `http://localhost:${env.PORT}/docs`,
        health: `http://localhost:${env.PORT}/api/health`,
      },
      `Server listening on http://localhost:${env.PORT}`,
    );
  });

  const stopTokenCleanup = startTokenCleanup();
  const stopReservationSweeper = startReservationSweeper();

  // Guards against a slow-loris style hang and matches the defaults most
  // reverse proxies expect.
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;

  // Graceful shutdown: stop taking new requests, let in-flight ones finish,
  // then close the database pool. Killing the process outright can leave a
  // half-written order behind.
  let shuttingDown = false;

  async function shutdown(signal, code = 0) {
    // A second SIGTERM (or a signal arriving mid-shutdown) must not start a
    // second teardown and disconnect Prisma from under in-flight requests.
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "Shutting down");
    stopTokenCleanup();
    stopReservationSweeper();

    // Don't hang forever if a request is stuck. Registered before the close
    // callback so a handler that never finishes cannot outlive it.
    const forceExit = setTimeout(() => {
      logger.error("Forced shutdown after 10s timeout");
      process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close(async () => {
      try {
        await Promise.allSettled([prisma.$disconnect(), closeRedis()]);
        logger.info("Closed cleanly");
      } catch (err) {
        logger.error({ err }, "Error during disconnect");
        code = 1;
      }
      clearTimeout(forceExit);
      process.exit(code);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // A promise rejection nobody caught means the app is in an unknown state.
  // Log it and exit rather than continuing on corrupt assumptions.
  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "Unhandled promise rejection");
    shutdown("unhandledRejection", 1);
  });

  // Same reasoning, but stricter: after an uncaught exception the process may
  // hold half-mutated module state, so finish in-flight work and leave. The
  // process manager restarts us clean.
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    shutdown("uncaughtException", 1);
  });
}

start();
