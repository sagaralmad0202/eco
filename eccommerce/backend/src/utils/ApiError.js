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

  // Upstream failure (provider/token endpoint unreachable). 502, not 500:
  // the bug is not in this app and retrying later is the honest advice.
  static badGateway(message = "Upstream service failure") {
    return new ApiError(502, message);
  }

  // Feature present in the code but not enabled in this deployment's env.
  static serviceUnavailable(message = "Feature is not configured") {
    return new ApiError(503, message);
  }

  // Rate limit exceeded (HTTP 429)
  static tooManyRequests(
    message = "Too many requests. Please try again later.",
    details,
  ) {
    return new ApiError(429, message, details);
  }
}

module.exports = ApiError;
