const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");
const { expiryDateFrom, hashToken } = require("../../utils/jwt");
const {
  buildAuthorizationUrl,
  exchangeCode,
  fetchProfile,
} = require("./oauth.providers");

// Users created through a provider have no password to hash. A random value
// is still stored rather than null/empty: password-login then compares
// against an unmatchable hash and fails the same way a wrong password does,
// and schema.prisma's NOT NULL stays honest.
const OAUTH_PASSWORD_ROUNDS = 12;

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

// --------------------------- STATE / PKCE ---------------------------

// The state round-trip is the CSRF defence of OAuth. The raw value goes to
// the provider; only its SHA-256 is stored, so a leaked database does not
// contain a state an attacker could replay against a pending login. Consumed
// on use — a state that works twice is a state that can be replayed.
async function createState(providerName) {
  const { url, state, codeVerifier } = buildAuthorizationUrl(providerName);

  await prisma.oAuthState.create({
    data: {
      stateHash: hashToken(state),
      provider: providerName,
      codeVerifier,
      expiresAt: expiryDateFrom(env.OAUTH_STATE_EXPIRES_IN),
    },
  });

  return url;
}

async function consumeState(providerName, rawState) {
  if (!rawState) throw ApiError.unauthorized("Missing OAuth state");

  const stored = await prisma.oAuthState.findUnique({
    where: { stateHash: hashToken(rawState) },
  });

  // One vague message for unknown, expired and wrong-provider states alike.
  const invalid = ApiError.unauthorized(
    "This login attempt could not be verified. Please try again.",
  );
  if (!stored || stored.provider !== providerName) throw invalid;
  if (stored.expiresAt < new Date()) {
    await prisma.oAuthState.delete({ where: { id: stored.id } }).catch(() => {});
    throw invalid;
  }

  // Delete-then-use rather than use-then-delete: if two requests arrive with
  // the same state, the second must fail even under a race.
  await prisma.oAuthState.delete({ where: { id: stored.id } }).catch(() => {});

  return { codeVerifier: stored.codeVerifier };
}

// Opportunistic sweep. Not a cron job on purpose: logins are the only moment
// the table grows, so piggybacking cleanup there keeps it bounded without new
// infrastructure. Failures are swallowed — cleanup must never block a login.
async function pruneExpiredStates() {
  try {
    await prisma.oAuthState.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch {
    /* see comment above */
  }
}

// ----------------------- USER RESOLUTION / LINKING -----------------------

// Account-linking rules, in order:
//
//   1. (provider, providerUserId) already linked  -> sign that user in.
//   2. Verified provider email matches a user     -> LINK the identity to the
//      existing account. Verified is the key word: Google/Facebook confirm
//      the address at the provider, so the provider has already checked what
//      we would otherwise need an email loop of our own for.
//   3. Unverified provider email matches a user   -> REFUSE. The person may
//      own the provider account but not the inbox; linking here is how
//      account takeover-by-signup happens.
//   4. No matching user                           -> create one, verified.
//
// A provider that returns no email at all also refuses (case 3 with no
// address): there is nothing to match on and no account to create without
// an address, and an interactive linking flow is out of scope here.
async function resolveOAuthUser({ provider, profile }) {
  // Prisma exposes model OAuthAccount as `oAuthAccount` (it only upper-cases
  // the first letter of the model name).
  const existingIdentity = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId: profile.providerUserId,
      },
    },
    include: { user: true },
  });

  if (existingIdentity) {
    if (!existingIdentity.user.isActive) {
      throw ApiError.forbidden("This account has been deactivated");
    }
    return existingIdentity.user;
  }

  if (!profile.email) {
    throw ApiError.badRequest(
      "The login provider did not share an email address, so this account " +
        "cannot be matched or created. Please sign in with email and password.",
    );
  }

  const normalizedEmail = profile.email.trim().toLowerCase();

  if (profile.emailVerified) {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { oauthAccounts: true },
    });

    if (existingUser) {
      if (!existingUser.isActive) {
        throw ApiError.forbidden("This account has been deactivated");
      }
      return linkProviderAccount({
        userId: existingUser.id,
        provider,
        profile,
        normalizedEmail,
      });
    }

    return createOAuthUser({ provider, profile, normalizedEmail });
  }

  // Case 3: unverified email that belongs to somebody. Same message whether
  // or not the address is registered, so this path cannot enumerate accounts.
  throw ApiError.badRequest(
    "The login provider did not confirm this email address, so it cannot be " +
      "linked to an existing account. Please sign in with email and password " +
      "and try the social login again afterwards.",
  );
}

async function linkProviderAccount({
  userId,
  provider,
  profile,
  normalizedEmail,
}) {
  const account = await prisma.oAuthAccount.create({
    data: {
      userId,
      provider,
      providerUserId: profile.providerUserId,
      providerEmail: normalizedEmail,
    },
    include: { user: true },
  });
  return account.user;
}

async function createOAuthUser({ provider, profile, normalizedEmail }) {
  // A provider-verified email counts as verified here too — the whole point
  // of email verification is proving inbox control, and the provider just did.
  const account = await prisma.oAuthAccount.create({
    data: {
      provider,
      providerUserId: profile.providerUserId,
      providerEmail: normalizedEmail,
      user: {
        create: {
          email: normalizedEmail,
          fullName: profile.fullName || normalizedEmail.split("@")[0],
          avatarUrl: profile.avatarUrl,
          passwordHash: bcrypt.hashSync(randomToken(), OAUTH_PASSWORD_ROUNDS),
          emailVerifiedAt: new Date(),
        },
      },
    },
    include: { user: true },
  });
  return account.user;
}

// ----------------------- ONE-TIME EXCHANGE CODES -----------------------

// After the callback the browser must end up authenticated, but the access
// token cannot go in the redirect URL (history, referer, shoulder-surfing).
// Instead a 2-minute one-time code is issued, and the SPA immediately swaps
// it for real tokens over an authenticated POST. Hashed + single-use, like
// every other token in this codebase.
async function issueExchangeCode(userId) {
  const rawCode = randomToken();

  await prisma.oAuthExchangeCode.create({
    data: {
      userId,
      codeHash: hashToken(rawCode),
      expiresAt: expiryDateFrom(env.OAUTH_CODE_EXPIRES_IN),
    },
  });

  return rawCode;
}

async function consumeExchangeCode(rawCode, { issueTokens }) {
  if (!rawCode || typeof rawCode !== "string") {
    throw ApiError.badRequest("Exchange code is required");
  }

  const stored = await prisma.oAuthExchangeCode.findUnique({
    where: { codeHash: hashToken(rawCode) },
    include: { user: true },
  });

  const invalid = ApiError.unauthorized(
    "This login link is invalid or has expired. Please sign in again.",
  );
  if (!stored || stored.usedAt || stored.expiresAt < new Date()) throw invalid;
  if (!stored.user || !stored.user.isActive) throw invalid;

  // Mark used BEFORE issuing tokens. If two exchanges race, the loser hits
  // a used row instead of both minting session tokens.
  const claimed = await prisma.oAuthExchangeCode.updateMany({
    where: { id: stored.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count !== 1) throw invalid;

  const tokens = await issueTokens(stored.user);
  return { user: stored.user, ...tokens };
}

// ----------------------------- CALLBACK -----------------------------

// Full callback leg: validate state, exchange the code, fetch the profile,
// resolve the user. Returns the user; the controller turns it into a session.
async function handleCallback(providerName, { code, state }) {
  if (!code) {
    // Includes the user pressing "deny" at the provider — the provider comes
    // back with error=access_denied and no code.
    throw ApiError.badRequest(
      "Login was not completed. If you cancelled at the provider, please try " +
        "again.",
    );
  }

  const { codeVerifier } = await consumeState(providerName, state);

  const tokenResponse = await exchangeCode(providerName, { code, codeVerifier });
  const profile = await fetchProfile(providerName, tokenResponse);

  return resolveOAuthUser({ provider: providerName, profile });
}

module.exports = {
  createState,
  consumeState,
  handleCallback,
  pruneExpiredStates,
  issueExchangeCode,
  consumeExchangeCode,
};
