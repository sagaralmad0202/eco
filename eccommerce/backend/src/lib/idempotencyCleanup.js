// Deletes idempotency key records that have expired.
//
// Without periodic cleanup the idempotency_keys table would grow indefinitely.
// Records are kept past their expiresAt for a short grace period so that a
// slow retry arriving seconds after expiry still gets a clear "key expired"
// rather than being treated as a brand-new request.
//
// Follows the same interval pattern as tokenCleanup.js.

const prisma = require("./prisma");
const logger = require("./logger");

const GRACE_MS = 1 * 60 * 60 * 1000; // 1 hour past expiresAt
const INTERVAL_MS = 1 * 60 * 60 * 1000; // run every hour

async function pruneExpiredIdempotencyKeys() {
  const cutoff = new Date(Date.now() - GRACE_MS);

  const result = await prisma.idempotencyKey.deleteMany({
    where: { expiresAt: { lt: cutoff } },
  });

  if (result.count > 0) {
    logger.info(
      { idempotencyKeysDeleted: result.count },
      "Pruned expired idempotency keys",
    );
  }

  return result.count;
}

// Returns a stop function so the server can clear the timer on shutdown.
function startIdempotencyCleanup() {
  const run = () =>
    pruneExpiredIdempotencyKeys().catch((err) =>
      logger.error({ err }, "Idempotency key cleanup failed"),
    );

  const timer = setInterval(run, INTERVAL_MS);
  timer.unref();

  // One pass at boot to catch any backlog.
  run();

  return () => clearInterval(timer);
}

module.exports = { pruneExpiredIdempotencyKeys, startIdempotencyCleanup };
