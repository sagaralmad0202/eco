const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");
const { sendPasswordResetEmail } = require("../../lib/mailer");
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

// Burned once at startup so login can compare against SOMETHING when the
// email does not exist, making a wrong email cost the same as a wrong
// password. See the comment in login().
//
// Generated rather than hardcoded on purpose: bcryptjs short-circuits and
// returns false immediately unless the hash is exactly 60 characters, which
// would silently defeat the whole point. A hand-typed literal is one typo
// away from that, and nothing would fail visibly.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "a-password-nobody-will-ever-use",
  BCRYPT_ROUNDS
);

// Never return passwordHash. Defining the shape once prevents it leaking
// from a route someone adds later.
const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  aboutYou: true,
  avatarUrl: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
};

// Login reads the whole row (it needs passwordHash to compare), so it cannot
// use a Prisma `select`. This projects that full row down to the same shape
// PUBLIC_USER_FIELDS produces, so /register, /login and /me never drift apart
// and passwordHash cannot ride along by accident.
function toPublicUser(user) {
  return Object.fromEntries(
    Object.keys(PUBLIC_USER_FIELDS).map((key) => [key, user[key]])
  );
}

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
  const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;

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
    user: toPublicUser(user),
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

// ------------------------- PASSWORD RESET -------------------------

// 32 random bytes, not a JWT. A reset token carries no claims worth reading
// and must be revocable the instant it is used — a stateless JWT cannot be
// un-issued, so the database row is the source of truth.
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// "30m" -> "30 minutes", for the email body.
function humanizeDuration(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return duration;

  const value = Number(match[1]);
  const unit = { s: "second", m: "minute", h: "hour", d: "day" }[match[2]];

  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

// CLIENT_ORIGIN may hold several comma-separated origins for CORS. The email
// needs exactly one, so the first is treated as the canonical site.
function resetUrlFor(rawToken) {
  const base = env.CLIENT_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
  return `${base}/reset-password?token=${rawToken}`;
}

// Always resolves the same way whether or not the email is registered.
//
// Returning "no account with that email" here would turn this endpoint into
// a free membership check: an attacker could submit a breached email list and
// learn exactly which of your customers to target.
async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, fullName: true, isActive: true },
  });

  // Deactivated accounts are treated as non-existent — a reset link must not
  // be a way back into a banned account.
  if (!user || !user.isActive) return;

  const rawToken = generateResetToken();

  // Invalidate any earlier unused links for this user in the same transaction
  // that creates the new one. Otherwise requesting a second reset leaves the
  // first link live, widening the window an intercepted email is useful for.
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: expiryDateFrom(env.PASSWORD_RESET_EXPIRES_IN),
      },
    }),
  ]);

  // A mail outage must not surface as a 500 here. The controller's reply is
  // identical either way, so a failure that changed the status code would
  // re-introduce the account-existence leak this function exists to prevent.
  try {
    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetUrl: resetUrlFor(rawToken),
      expiresInLabel: humanizeDuration(env.PASSWORD_RESET_EXPIRES_IN),
    });
  } catch (err) {
    console.error("[mail] password reset email failed:", err.message);
  }
}

async function resetPassword({ token, password }) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  // One message for missing, already-used and expired tokens. Distinguishing
  // them tells an attacker probing random tokens when they have found a real
  // one that merely expired.
  const invalid = ApiError.badRequest(
    "This reset link is invalid or has expired. Please request a new one."
  );

  if (!record || record.usedAt || record.expiresAt < new Date()) throw invalid;
  if (!record.user || !record.user.isActive) throw invalid;

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // All three writes together. A crash between them could leave the password
  // changed with the link still usable, or the old sessions still alive.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // The most likely reason for a reset is that someone else knows the old
    // password. Leaving their existing sessions alive would defeat the reset.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

// For users who know their password and are already logged in.
async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw ApiError.unauthorized("Account not found");

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.unauthorized("Your current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  // Every session was just revoked, including this one. Issue a fresh pair so
  // the device that made the change stays logged in and only the *other*
  // sessions are signed out.
  return issueTokens({ id: user.id, role: user.role });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  changePassword,
  PUBLIC_USER_FIELDS,
};
