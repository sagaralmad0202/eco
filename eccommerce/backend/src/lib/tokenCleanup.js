// Deletes token rows that can no longer be used.
//
// Every login writes a refresh token row and nothing ever removed them, so
// the table grows for the life of the product — a busy month of logins is
// millions of dead rows slowing every lookup on tokenHash.
//
// Rows are kept for a grace period past expiry rather than deleted the moment
// they lapse, so that "your session expired" can still be distinguished from
// "this token never existed" while investigating a report.

const prisma = require("./prisma");
const logger = require("./logger");

const GRACE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

async function pruneExpiredTokens() {
  const cutoff = new Date(Date.now() - GRACE_MS);

  const [refresh, reset, verification] = await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: cutoff } } }),
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: cutoff } },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { expiresAt: { lt: cutoff } },
    }),
  ]);

  const total = refresh.count + reset.count + verification.count;

  if (total > 0) {
    logger.info(
      {
        refreshTokens: refresh.count,
        passwordResetTokens: reset.count,
        emailVerificationTokens: verification.count,
      },
      "Pruned expired tokens"
    );
  }

  return total;
}

// Returns a stop function so the server can clear the timer on shutdown —
// a live interval keeps the event loop alive and blocks a clean exit.
function startTokenCleanup() {
  // A failure here must never take the process down: this is housekeeping,
  // not request handling.
  const run = () =>
    pruneExpiredTokens().catch((err) =>
      logger.error({ err }, "Token cleanup failed")
    );

  const timer = setInterval(run, INTERVAL_MS);

  // Do not hold the process open purely for cleanup.
  timer.unref();

  // One pass at boot, so a long-running deploy gap is caught immediately.
  run();

  return () => clearInterval(timer);
}

module.exports = { pruneExpiredTokens, startTokenCleanup };
