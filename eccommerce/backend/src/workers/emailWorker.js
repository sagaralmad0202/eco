// Email worker — processes "send-email" jobs from the pg-boss queue.
//
// The worker reuses the existing mailer.js transport so there is exactly one
// SMTP connection pool regardless of whether emails are sent synchronously
// (dev/fallback) or through the queue (production pattern).
//
// Job data shape:
//   { type: "password-reset" | "verification", to, fullName, resetUrl?, verifyUrl?, expiresInLabel }
//
// Retries are handled by pg-boss (3 attempts, exponential backoff configured
// in jobQueue.js). After all retries fail, the job lands in the dead-letter
// archive and is logged here.

const {
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require("../lib/mailer");
const logger = require("../lib/logger");

/**
 * Processes a single email job.
 *
 * @param {object} job - pg-boss job object. `job.data` holds the email payload.
 */
async function handleEmailJob(job) {
  const { type, to, fullName, resetUrl, verifyUrl, expiresInLabel } = job.data;

  logger.info(
    { jobId: job.id, type, to },
    "[email-worker] Processing send-email job",
  );

  switch (type) {
    case "password-reset":
      await sendPasswordResetEmail({ to, fullName, resetUrl, expiresInLabel });
      break;

    case "verification":
      await sendVerificationEmail({ to, fullName, verifyUrl, expiresInLabel });
      break;

    default:
      // Unknown type — log and don't retry (throwing would retry forever on
      // a payload that will never become valid).
      logger.error(
        { jobId: job.id, type },
        "[email-worker] Unknown email job type — skipping",
      );
      return;
  }

  logger.info(
    { jobId: job.id, type, to },
    "[email-worker] Email sent successfully",
  );
}

/**
 * Register the email worker with the job queue.
 * Called once at server startup after `startQueue()`.
 */
async function registerEmailWorker(registerWorker) {
  await registerWorker("send-email", handleEmailJob, {
    // Process one email at a time to stay within Gmail SMTP rate limits.
    // pg-boss fetches the next job as soon as the current one finishes.
    teamSize: 1,
    teamConcurrency: 1,
  });
}

module.exports = { registerEmailWorker, handleEmailJob };
