// Background job queue powered by pg-boss.
//
// pg-boss stores jobs in PostgreSQL tables it manages itself, so there is no
// separate broker to run or pay for. The tables are created automatically on
// the first call to `boss.start()`.
//
// Usage:
//   const { enqueue } = require("./jobQueue");
//   await enqueue("send-email", { to: "user@example.com", ... });
//
// Workers register handlers at boot via `registerWorkers()`. Each handler
// receives a job and may throw to trigger automatic retry (3 attempts,
// exponential backoff). After all retries are exhausted the job moves to a
// dead-letter state and is logged.

const PgBoss = require("pg-boss");
const env = require("../config/env");
const logger = require("./logger");

let boss = null;
let started = false;

/**
 * Returns the singleton pg-boss instance. Created lazily so modules can
 * import `enqueue` at require-time without pg-boss connecting before the
 * server is ready.
 */
function getInstance() {
  if (!boss) {
    boss = new PgBoss({
      connectionString: env.DATABASE_URL,

      // How often pg-boss checks for new jobs (in seconds).
      // 2s keeps latency low for emails without polling too aggressively.
      newJobCheckIntervalSeconds: 2,

      // Automatically archive completed/failed jobs after 7 days.
      archiveCompletedAfterSeconds: 7 * 24 * 60 * 60,
      archiveFailedAfterSeconds: 14 * 24 * 60 * 60,

      // Keep maintenance queries light on Neon free tier.
      maintenanceIntervalMinutes: 5,

      // Do not let pg-boss call process.exit on its own.
      onComplete: false,
    });

    boss.on("error", (err) => {
      logger.error({ err }, "[job-queue] pg-boss error");
    });
  }

  return boss;
}

/**
 * Start the job queue. Call once after the database is connected.
 * pg-boss creates its schema tables on the first run automatically.
 */
async function startQueue() {
  const instance = getInstance();

  if (started) return instance;

  await instance.start();
  started = true;

  logger.info("[job-queue] pg-boss started");
  return instance;
}

/**
 * Stop the job queue gracefully. Lets in-flight jobs finish before closing.
 * Call during server shutdown.
 */
async function stopQueue() {
  if (!boss || !started) return;

  try {
    await boss.stop({ graceful: true, timeout: 8000 });
    started = false;
    logger.info("[job-queue] pg-boss stopped");
  } catch (err) {
    logger.error({ err }, "[job-queue] Error stopping pg-boss");
  }
}

/**
 * Enqueue a job for background processing.
 *
 * @param {string} name - The queue name (e.g. "send-email").
 * @param {object} data - Serializable payload passed to the worker.
 * @param {object} [options] - pg-boss send options (retryLimit, retryDelay, etc.).
 * @returns {Promise<string|null>} The job ID, or null if the queue hasn't started.
 */
async function enqueue(name, data, options = {}) {
  if (!started) {
    // Queue not started yet (e.g. during tests or early boot).
    // Fall back to logging so the call site doesn't need to know.
    logger.warn(
      { jobName: name },
      "[job-queue] Queue not started — job not enqueued",
    );
    return null;
  }

  const defaults = {
    retryLimit: 3,
    retryDelay: 30,       // seconds between first retry
    retryBackoff: true,   // exponential: 30s, 60s, 120s
    expireInMinutes: 15,  // kill the job if it runs longer than 15 min
  };

  const jobId = await boss.send(name, data, { ...defaults, ...options });
  logger.debug({ jobName: name, jobId }, "[job-queue] Job enqueued");
  return jobId;
}

/**
 * Register a worker handler for a named queue. Called at boot after startQueue().
 *
 * @param {string} name - Queue name to listen on.
 * @param {function} handler - async (job) => void. Throw to trigger retry.
 * @param {object} [options] - pg-boss work options.
 */
async function registerWorker(name, handler, options = {}) {
  if (!boss || !started) {
    throw new Error(
      `Cannot register worker "${name}" — call startQueue() first`,
    );
  }

  await boss.work(name, options, handler);
  logger.info({ queue: name }, "[job-queue] Worker registered");
}

module.exports = {
  startQueue,
  stopQueue,
  enqueue,
  registerWorker,
  // Exposed for testing only.
  _getInstance: getInstance,
};
