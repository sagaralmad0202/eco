// Central error handler. Must be registered LAST in app.js, and must keep
// all four arguments — Express identifies error middleware by arity.

const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const logger = require("../lib/logger");

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = "Something went wrong";
  let details;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation, e.g. duplicate email
    if (err.code === "P2002") {
      statusCode = 409;
      const field = err.meta?.target?.[0] ?? "value";
      message = `That ${field} is already in use`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database request failed";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Cannot reach the database";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body is not valid JSON";
  }

  // Log the real error server-side, tagged with the request id so it can be
  // matched to the client's report. Never send stack traces to clients:
  // they reveal file paths and package versions to attackers.
  const log = req.log ?? logger;

  if (statusCode >= 500) {
    log.error({ err, reqId: req.id }, "Request failed");
  } else {
    log.warn({ reqId: req.id, statusCode, reason: message }, "Request rejected");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    // Lets a user quote one short id in a bug report instead of pasting logs.
    requestId: req.id,
    ...(env.NODE_ENV === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = { errorHandler, notFoundHandler };
