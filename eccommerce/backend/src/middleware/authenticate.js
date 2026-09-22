const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/jwt");

const publicMediaUrl = require("../utils/publicMediaUrl");

const ACCESS_COOKIE_NAME = "accessToken";

function extractAccessToken(req) {
  const header = req.headers?.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  if (req.cookies?.[ACCESS_COOKIE_NAME]) {
    return req.cookies[ACCESS_COOKIE_NAME];
  }
  return null;
}

// Requires a valid access token (via HttpOnly cookie or Bearer header). Attaches req.user.
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    throw ApiError.unauthorized("Missing access token");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // The client should call /api/auth/refresh and retry.
      throw ApiError.unauthorized("Access token expired");
    }
    throw ApiError.unauthorized("Invalid access token");
  }

  // Re-read the user on every request. A token issued before an account was
  // banned must stop working immediately, not when the token expires.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      avatarUrl: true,
      address: true,
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account is no longer active");
  }

  user.avatarUrl = publicMediaUrl(user.avatarUrl);
  req.user = user;
  req.token = token;
  next();
});

// Use AFTER authenticate:  router.post("/", authenticate, requireRole("ADMIN"), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("You do not have access to this resource"),
      );
    }
    next();
  };
}

// Attaches req.user when a valid token is present (cookie or Bearer header),
// and carries on quietly only when no token was sent.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractAccessToken(req);

  if (!token) return next();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token expired");
    }
    throw ApiError.unauthorized("Invalid access token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      avatarUrl: true,
      address: true,
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account is no longer active");
  }

  user.avatarUrl = publicMediaUrl(user.avatarUrl);
  req.user = user;
  req.token = token;

  next();
});

// Use AFTER authenticate. Gates operations that require a verified email
// (e.g. placing orders, making payments). A user who has not yet verified
// can still browse, manage their cart, and resend the verification email.
function requireVerifiedEmail(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (!req.user.emailVerifiedAt) {
    return next(
      ApiError.forbidden(
        "Please verify your email address before continuing. " +
          "Check your inbox or request a new verification link.",
      ),
    );
  }
  next();
}

module.exports = {
  authenticate,
  requireRole,
  requireVerifiedEmail,
  optionalAuth,
  extractAccessToken,
  ACCESS_COOKIE_NAME,
};
