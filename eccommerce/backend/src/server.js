const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");

async function start() {
  // Connect before accepting traffic, so a bad DATABASE_URL fails loudly
  // here instead of on a customer's first request.
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (err) {
    console.error("\nCould not connect to the database.");
    console.error("Check DATABASE_URL in your .env file.\n");
    console.error(err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`\nServer running:  http://localhost:${env.PORT}`);
    console.log(`Health check:    http://localhost:${env.PORT}/api/health`);
    console.log(`Products:        http://localhost:${env.PORT}/api/products`);
    console.log(`Environment:     ${env.NODE_ENV}\n`);
  });

  // Graceful shutdown: stop taking new requests, let in-flight ones finish,
  // then close the database pool. Killing the process outright can leave a
  // half-written order behind.
  async function shutdown(signal) {
    console.log(`\n${signal} received, shutting down...`);

    server.close(async () => {
      await prisma.$disconnect();
      console.log("Closed cleanly.");
      process.exit(0);
    });

    // Don't hang forever if a request is stuck.
    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // A promise rejection nobody caught means the app is in an unknown state.
  // Log it and exit rather than continuing on corrupt assumptions.
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
    shutdown("unhandledRejection");
  });
}

start();
