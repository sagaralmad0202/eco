const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  expiryDateFrom,
} = require("../../utils/jwt");

// Cost 12 ≈ 250ms per hash on typical hardware. High enough to make offline
// brute-forcing expensive, low enough not to stall the event loop noticeably.
const BCRYPT_ROUNDS = 12;

// Never return passwordHash. Defining the shape once prevents it leaking
// from a route someone adds later.
const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  createdAt: true,
};

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: expiryDateFrom(env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  return { accessToken, refreshToken };
}

async function register({ email, password, fullName, phone }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // No pre-check for an existing email: two simultaneous requests could both
  // pass it. The unique index is the real guard — P2002 becomes a 409 in the
  // error handler. Checking first would be a race condition.
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, phone },
    select: PUBLIC_USER_FIELDS,
  });

  const tokens = await issueTokens({ id: user.id, role: user.role });
  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Compare against a dummy hash when the user does not exist, so that a
  // wrong email and a wrong password take the same time to answer. Skipping
  // this leaks which emails are registered via response timing.
  const hashToCompare =
    user?.passwordHash ??
    "$2a$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012";

  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  // One vague message for both cases, on purpose — never confirm that an
  // email exists to someone who cannot log in.
  if (!user || !passwordMatches) {
    throw ApiError.unauthorized("Incorrect email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  const tokens = await issueTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    ...tokens,
  };
}

// Rotation: every refresh revokes the old token and issues a new one. If a
// stolen token is used, the legitimate user's next refresh fails and the
// theft becomes visible instead of granting silent permanent access.
async function refresh(rawToken) {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is no longer valid");
  }

  if (stored.userId !== payload.sub) {
    throw ApiError.unauthorized("Refresh token does not match its user");
  }

  if (!stored.user.isActive) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(stored.user);
}

// Idempotent by design: logging out twice, or with a token that was already
// revoked, is not an error worth surfacing to the client.
async function logout(rawToken) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function logoutAllDevices(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  PUBLIC_USER_FIELDS,
};
