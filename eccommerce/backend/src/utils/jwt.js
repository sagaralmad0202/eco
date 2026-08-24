const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Two different secrets on purpose. If the access secret ever leaks, an
// attacker still cannot mint refresh tokens and keep the session alive.

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
}

// Refresh tokens are stored in the database as SHA-256 hashes, never raw —
// the same reasoning as password hashing. A stolen database dump then
// contains nothing an attacker can replay.
//
// SHA-256 (not bcrypt) is correct here: the token is already 200+ bits of
// randomness, so it needs no slow hashing, and lookups must be fast.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Turns "7d" / "15m" / "30s" into a future Date, for the DB expiry column.
function expiryDateFrom(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];

  return new Date(Date.now() + value * unitMs);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  expiryDateFrom,
};
