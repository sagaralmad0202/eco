// Per-provider OAuth 2.0 details: authorization URL, token endpoint, scopes,
// and how to normalise the provider's profile response.
//
// All requests use Node's global fetch — no SDK needed for a flow that is,
// end to end, two POSTs and one GET. Secrets live in env and never leave the
// server: the browser only ever sees the redirect to the provider.

const crypto = require("crypto");

const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");

// PKCE code challenge: S256 (SHA-256 base64url), never "plain". Twitter
// requires PKCE outright; Google supports it and it costs nothing. Facebook
// ignores extra params, so it is simply not sent there.
function base64url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const PROVIDERS = {
  google: {
    // OpenID Connect: "openid" is what makes id_token appear in the response.
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    usePkce: true,

    clientId: () => env.GOOGLE_CLIENT_ID,
    clientSecret: () => env.GOOGLE_CLIENT_SECRET,
    redirectUri: () => env.OAUTH_PROVIDERS.google.redirectUri,

    // Google returns profile claims inside a signed id_token. Verifying the
    // signature would mean fetching Google's JWKS; instead the token endpoint
    // is called server-to-server over TLS with our secret, which is itself
    // proof the response came from Google — the profile it carries is trusted
    // for the same reason any token-endpoint response is.
    profile(tokenResponse) {
      const claims = JSON.parse(
        Buffer.from(tokenResponse.id_token.split(".")[1], "base64url").toString(
          "utf8",
        ),
      );
      return {
        providerUserId: claims.sub,
        email: claims.email || null,
        emailVerified: claims.email_verified === true,
        fullName: claims.name || null,
        avatarUrl: claims.picture || null,
      };
    },
  },

  facebook: {
    // Facebook Login (OAuth 2.0). "email" must be requested explicitly or the
    // profile comes back without one.
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    profileUrl: "https://graph.facebook.com/v19.0/me",
    scope: "email public_profile",
    usePkce: false,

    clientId: () => env.FACEBOOK_CLIENT_ID,
    clientSecret: () => env.FACEBOOK_CLIENT_SECRET,
    redirectUri: () => env.OAUTH_PROVIDERS.facebook.redirectUri,

    // Facebook's access_token response contains no profile; a second GET is
    // required. Fields are pinned so the response shape cannot drift.
    async profile(tokenResponse) {
      const url = new URL(this.profileUrl);
      url.searchParams.set("fields", "id,name,email,picture.width(256)");
      url.searchParams.set("access_token", tokenResponse.access_token);

      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw ApiError.badGateway("Facebook profile request failed");
      const body = await res.json();

      return {
        providerUserId: body.id,
        email: body.email || null,
        // Facebook only returns an email the user has confirmed, so its
        // presence implies verification.
        emailVerified: Boolean(body.email),
        fullName: body.name || null,
        avatarUrl: body.picture?.data?.url || null,
      };
    },
  },

  twitter: {
    // Twitter/X OAuth 2.0 (authorization code + PKCE, mandatory). Note this
    // is NOT the older OAuth 1.0a flow — X has deprecated it for new apps.
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scope: "users.read tweet.read offline.access",
    usePkce: true,

    clientId: () => env.TWITTER_CLIENT_ID,
    clientSecret: () => env.TWITTER_CLIENT_SECRET,
    redirectUri: () => env.OAUTH_PROVIDERS.twitter.redirectUri,

    async profile(tokenResponse) {
      const res = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          authorization: `Bearer ${tokenResponse.access_token}`,
          accept: "application/json",
        },
      });
      if (!res.ok) throw ApiError.badGateway("Twitter profile request failed");
      const body = await res.json();
      const user = body.data || {};

      return {
        providerUserId: String(user.id),
        email: user.email || null, // X only returns email for approved apps
        // X does not report email verification; treat an unverified email as
        // no email — an unverified address proves nothing about ownership.
        emailVerified: Boolean(user.verified_email),
        fullName: user.name || null,
        avatarUrl: user.profile_image_url || null,
      };
    },
  },
};

function getProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) throw ApiError.badRequest(`Unknown OAuth provider: ${name}`);
  if (!env.OAUTH_PROVIDERS[name]?.enabled) {
    throw ApiError.serviceUnavailable(
      `${name} login is not configured on this server`,
    );
  }
  return provider;
}

// Builds the URL the browser is sent to. Returns { url, state, codeVerifier }
// so the caller can persist state/verifier server-side before redirecting.
function buildAuthorizationUrl(providerName) {
  const provider = getProvider(providerName);
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const url = new URL(provider.authUrl);

  url.searchParams.set("client_id", provider.clientId());
  url.searchParams.set("redirect_uri", provider.redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scope);
  url.searchParams.set("state", state);

  let codeVerifier = null;
  if (provider.usePkce) {
    codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(48)));
    const challenge = base64url(
      crypto.createHash("sha256").update(codeVerifier).digest(),
    );
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
  }

  return { url: url.toString(), state, codeVerifier };
}

// Exchanges the authorization code server-to-server. Any failure here —
// expired code, redirect_uri mismatch, network error — surfaces as one vague
// ApiError so the provider's exact complaint is not relayed back to whoever
// is poking the callback with forged parameters.
async function exchangeCode(providerName, { code, codeVerifier }) {
  const provider = getProvider(providerName);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: provider.redirectUri(),
    client_id: provider.clientId(),
    client_secret: provider.clientSecret(),
  });
  if (codeVerifier) body.set("code_verifier", codeVerifier);

  let res;
  try {
    res = await fetch(provider.tokenUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body,
    });
  } catch {
    throw ApiError.badGateway("Could not reach the login provider");
  }

  if (!res.ok) {
    // Never log the response body: it can contain echoes of request
    // parameters. Status alone is enough to diagnose.
    throw ApiError.badGateway("Login provider rejected the authorization code");
  }

  return res.json();
}

// Wraps the provider's profile call so a malformed response (missing id,
// non-string fields) fails loudly instead of creating a broken identity row.
async function fetchProfile(providerName, tokenResponse) {
  const provider = getProvider(providerName);
  const profile = await provider.profile(tokenResponse);

  if (!profile.providerUserId || typeof profile.providerUserId !== "string") {
    throw ApiError.badGateway("Login provider returned an invalid profile");
  }

  return profile;
}

module.exports = {
  getProvider,
  buildAuthorizationUrl,
  exchangeCode,
  fetchProfile,
};
