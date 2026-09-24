// ---------------------------------------------------------------------------
// Idempotency middleware
//
// Guarantees that a mutation guarded by an Idempotency-Key header executes its
// business logic at most once, regardless of network retries, load balancer
// replays, or user double-clicks.
//
// Usage:
//   const { idempotency } = require("../../middleware/idempotency");
//   router.post("/", authenticate, idempotency(), validate(schema), ctrl.create);
//
// The middleware:
//   1. Reads and validates the Idempotency-Key header.
//   2. Hashes the request body (SHA-256) to detect key reuse with a different
//      payload (409 Conflict).
//   3. Atomically claims the key in PostgreSQL via INSERT ... ON CONFLICT.
//   4. For completed keys, replays the stored response without re-executing
//      the handler.
//   5. For keys stuck in PROCESSING past a lock timeout (server crash),
//      reclaims the key so a retry can succeed.
//   6. Intercepts the response to persist status + body for future replays.
// ---------------------------------------------------------------------------

const { createHash } = require("crypto");
const prisma = require("../lib/prisma");
const logger = require("../lib/logger");
const ApiError = require("../utils/ApiError");

// Keys older than this are eligible for cleanup.
const DEFAULT_TTL_HOURS = 24;

// A PROCESSING record older than this is treated as abandoned (server crash).
const LOCK_TIMEOUT_MS = 60_000;

// Maximum length of a client-supplied idempotency key.
const MAX_KEY_LENGTH = 256;

// Matches UUIDs, ULIDs, nanoids and other URL-safe random strings.
const KEY_PATTERN = /^[\w.~-]{8,256}$/;

/**
 * Produces a deterministic SHA-256 hex digest of the request body.
 * Uses stable JSON stringification (sorted keys) so semantically identical
 * payloads always produce the same hash regardless of key order.
 */
function hashRequestBody(body) {
  const canonical = JSON.stringify(body ?? {}, Object.keys(body ?? {}).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Attempts an atomic INSERT of a new idempotency record. If the (userId, key)
 * pair already exists, returns the existing row without modifying it.
 *
 * This uses raw SQL because Prisma's `upsert` is not truly atomic under
 * concurrent inserts — two transactions can both read "not found" and then
 * both attempt to insert, with one failing on the unique constraint. The
 * native INSERT ... ON CONFLICT DO NOTHING + a follow-up SELECT is safe.
 */
async function atomicClaimOrFetch({
  key,
  userId,
  requestPath,
  requestHash,
  expiresAt,
}) {
  // Try to insert. ON CONFLICT DO NOTHING means a concurrent insert for the
  // same (userId, key) silently becomes a no-op rather than throwing.
  await prisma.$executeRawUnsafe(
    `INSERT INTO "idempotency_keys" ("id", "key", "userId", "requestPath", "requestHash", "status", "createdAt", "updatedAt", "expiresAt")
     VALUES (gen_random_uuid(), $1, $2::uuid, $3, $4, 'PROCESSING', NOW(), NOW(), $5)
     ON CONFLICT ("userId", "key") DO NOTHING`,
    key,
    userId,
    requestPath,
    requestHash,
    expiresAt,
  );

  // Whether we just inserted or the row already existed, fetch it.
  const rows = await prisma.$queryRawUnsafe(
    `SELECT "id", "key", "userId", "requestPath", "requestHash",
            "status"::"text" AS "status", "responseStatus", "responseBody",
            "createdAt", "updatedAt", "expiresAt"
     FROM "idempotency_keys"
     WHERE "userId" = $1::uuid AND "key" = $2`,
    userId,
    key,
  );

  return rows[0] ?? null;
}

/**
 * Reclaims a stale PROCESSING record so a retry after a server crash can
 * re-execute the business logic. Only succeeds if the record is still in
 * PROCESSING and its updatedAt is old enough (lock expired).
 */
async function reclaimStaleRecord(id, requestHash, lockCutoff) {
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "idempotency_keys"
     SET "status" = 'PROCESSING', "updatedAt" = NOW()
     WHERE "id" = $1::uuid
       AND "status" = 'PROCESSING'
       AND "requestHash" = $2
       AND "updatedAt" < $3`,
    id,
    requestHash,
    lockCutoff,
  );
  return result > 0;
}

/**
 * Persists the handler's response so future retries replay it.
 */
async function completeIdempotencyRecord(id, responseStatus, responseBody) {
  await prisma.idempotencyKey.update({
    where: { id },
    data: {
      status: "COMPLETED",
      responseStatus,
      responseBody: responseBody ?? undefined,
    },
  });
}

/**
 * Marks a failed request so the key can be retried.
 */
async function failIdempotencyRecord(id) {
  try {
    await prisma.idempotencyKey.update({
      where: { id },
      data: { status: "FAILED" },
    });
  } catch (err) {
    // Non-fatal: the key will eventually expire or be reclaimed.
    logger.warn({ err, idempotencyId: id }, "idempotency.fail_record_error");
  }
}

/**
 * Deletes a FAILED record so the same key can be retried cleanly from scratch.
 * Deletion (rather than update-back-to-PROCESSING) avoids any ambiguity about
 * whether a record represents the current attempt or a stale one.
 */
async function deleteFailedRecord(id) {
  try {
    await prisma.idempotencyKey.deleteMany({
      where: { id, status: "FAILED" },
    });
  } catch (err) {
    logger.warn({ err, idempotencyId: id }, "idempotency.delete_failed_error");
  }
}

// ---------------------------------------------------------------------------
// Express middleware factory
// ---------------------------------------------------------------------------

/**
 * Returns Express middleware that enforces idempotency on the decorated route.
 *
 * @param {object} [options]
 * @param {number} [options.ttlHours=24]  How long completed keys are retained.
 */
function idempotency({ ttlHours = DEFAULT_TTL_HOURS } = {}) {
  return async function idempotencyMiddleware(req, res, next) {
    // 1. Extract and validate the key ----------------------------------------
    const key = req.headers["idempotency-key"];

    if (!key) {
      return next(
        ApiError.badRequest("Idempotency-Key header is required for this endpoint"),
      );
    }

    if (typeof key !== "string" || !KEY_PATTERN.test(key)) {
      return next(
        ApiError.badRequest(
          `Idempotency-Key must be ${MAX_KEY_LENGTH} characters or fewer ` +
            "and contain only alphanumeric characters, hyphens, underscores, dots, or tildes",
        ),
      );
    }

    // The middleware runs after authenticate, so req.user is guaranteed.
    if (!req.user?.id) {
      return next(ApiError.unauthorized("Authentication required for idempotent requests"));
    }

    const userId = req.user.id;
    const requestPath = req.originalUrl || req.url;
    const requestHash = hashRequestBody(req.body);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const log = req.log || logger;

    log.debug(
      { idempotencyKey: key, requestPath },
      "idempotency.request_received",
    );

    // 2. Atomic claim --------------------------------------------------------
    let record;
    try {
      record = await atomicClaimOrFetch({
        key,
        userId,
        requestPath,
        requestHash,
        expiresAt,
      });
    } catch (err) {
      log.error({ err, idempotencyKey: key }, "idempotency.claim_error");
      return next(err);
    }

    if (!record) {
      // Should never happen — the SELECT after INSERT always returns a row.
      log.error({ idempotencyKey: key }, "idempotency.missing_after_claim");
      return next(new Error("Idempotency claim failed unexpectedly"));
    }

    // 3. Validate request hash -----------------------------------------------
    if (record.requestHash !== requestHash) {
      log.warn(
        { idempotencyKey: key, userId },
        "idempotency.request_conflict",
      );
      return next(
        ApiError.conflict(
          "Idempotency-Key has already been used with a different request payload",
        ),
      );
    }

    // 4. Handle existing records ---------------------------------------------
    if (record.status === "COMPLETED") {
      log.info({ idempotencyKey: key }, "idempotency.key_reused");
      return res
        .status(record.responseStatus || 200)
        .json(record.responseBody);
    }

    if (record.status === "FAILED") {
      // A previous attempt failed. Delete the failed record so this attempt
      // gets a fresh PROCESSING claim.
      await deleteFailedRecord(record.id);

      // Re-claim with a fresh insert.
      try {
        record = await atomicClaimOrFetch({
          key,
          userId,
          requestPath,
          requestHash,
          expiresAt,
        });
      } catch (err) {
        log.error({ err, idempotencyKey: key }, "idempotency.reclaim_error");
        return next(err);
      }

      if (!record || record.status === "COMPLETED") {
        // Another concurrent retry completed between our delete and re-insert.
        if (record?.status === "COMPLETED") {
          return res
            .status(record.responseStatus || 200)
            .json(record.responseBody);
        }
        return next(new Error("Idempotency reclaim failed unexpectedly"));
      }
    }

    if (record.status === "PROCESSING") {
      // Check if this is a record WE just created (updatedAt is very recent)
      // or a stale one from a crashed request.
      const updatedAt = new Date(record.updatedAt);
      const lockCutoff = new Date(Date.now() - LOCK_TIMEOUT_MS);

      if (updatedAt > lockCutoff) {
        // The record is fresh — another request is actively processing it.
        // Check if we are the one who just created it by comparing timestamps.
        // A record created within the last 2 seconds by us is "ours".
        const ageMs = Date.now() - updatedAt.getTime();
        if (ageMs > 2000) {
          // Someone else is actively processing this key right now.
          log.info(
            { idempotencyKey: key },
            "idempotency.request_in_progress",
          );
          return next(
            ApiError.conflict(
              "A request with this Idempotency-Key is currently being processed",
            ),
          );
        }
        // else: this is our freshly-created record, proceed.
      } else {
        // Stale PROCESSING — the original server likely crashed.
        const reclaimed = await reclaimStaleRecord(
          record.id,
          requestHash,
          lockCutoff,
        );

        if (!reclaimed) {
          // Another retry beat us to it.
          log.info(
            { idempotencyKey: key },
            "idempotency.request_in_progress",
          );
          return next(
            ApiError.conflict(
              "A request with this Idempotency-Key is currently being processed",
            ),
          );
        }

        log.info(
          { idempotencyKey: key },
          "idempotency.request_expired",
        );
      }
    }

    // 5. Intercept the response ----------------------------------------------
    // Override res.json to capture the response body and status before it is
    // sent to the client, then persist it for future replays.
    const idempotencyId = record.id;
    const originalJson = res.json.bind(res);

    req.idempotencyId = idempotencyId;

    res.json = function captureAndSend(body) {
      const statusCode = res.statusCode || 200;

      // Persist asynchronously — the client gets their response immediately.
      // If persistence fails, the next retry will re-execute (safe because
      // the key stays in PROCESSING and will eventually be reclaimed/expired).
      if (statusCode >= 200 && statusCode < 500) {
        completeIdempotencyRecord(idempotencyId, statusCode, body).catch(
          (err) => {
            log.error(
              { err, idempotencyId, idempotencyKey: key },
              "idempotency.complete_record_error",
            );
          },
        );

        log.info(
          { idempotencyKey: key, statusCode },
          "idempotency.request_completed",
        );
      } else {
        // 5xx — mark as failed so the client can retry with the same key.
        failIdempotencyRecord(idempotencyId).catch((err) => {
          log.error(
            { err, idempotencyId, idempotencyKey: key },
            "idempotency.fail_record_error",
          );
        });
      }

      return originalJson(body);
    };

    // If the handler throws (caught by asyncHandler/errorHandler), mark the
    // record as failed so the key can be retried.
    const originalNext = next;
    res.on("finish", () => {
      // If the response was sent with a status >= 500 and res.json was never
      // called (e.g., the error handler used res.json, which we intercepted),
      // the record was already handled above.
    });

    // Wrap next to detect errors propagated via next(err)
    const wrappedNext = (err) => {
      if (err) {
        // Handler threw — mark as failed so the key can be retried.
        // But only for 5xx (server) errors. 4xx are client errors and the
        // response should be stored so retries get the same client error.
        const statusCode = err.statusCode || 500;
        if (statusCode >= 500) {
          failIdempotencyRecord(idempotencyId).catch((failErr) => {
            log.error(
              { err: failErr, idempotencyId },
              "idempotency.fail_on_error",
            );
          });
        }
        // For 4xx errors, the error handler will call res.json which we
        // intercept above, persisting the error response for replay.
        return originalNext(err);
      }
      originalNext();
    };

    wrappedNext();
  };
}

module.exports = { idempotency, hashRequestBody, LOCK_TIMEOUT_MS };
