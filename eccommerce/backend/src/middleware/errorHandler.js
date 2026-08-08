// Central error handler. Must be registered LAST in app.js, and must keep
// all four arguments — Express identifies error middleware by arity.

const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

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
  }

  // Log the real error server-side. Never send stack traces to clients:
  // they reveal file paths and package versions to attackers.
  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = { errorHandler, notFoundHandler };
