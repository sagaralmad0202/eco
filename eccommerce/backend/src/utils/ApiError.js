// A predictable error type for anything the client did wrong.
//
// Throwing "new ApiError(404, 'Product not found')" anywhere in the app
// produces a clean JSON response. Anything else that throws is treated as
// an unexpected server bug and its details are hidden from the client.

class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // "we expected this could happen"
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Not authenticated") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Not allowed") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Already exists") {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
