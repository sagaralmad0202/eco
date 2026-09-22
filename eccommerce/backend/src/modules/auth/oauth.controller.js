const env = require("../../config/env");
const asyncHandler = require("../../utils/asyncHandler");
const oauthService = require("./oauth.service");
const authService = require("./auth.service");
const {
  setAuthCookies,
  absorbGuestCart,
} = require("./auth.controller");

const PROVIDERS = ["google", "facebook", "twitter"];

// The SPA page the browser lands on after the provider callback. It reads
// ?code= / ?error= and finishes the login with a POST to /oauth/exchange.
// CLIENT_ORIGIN may be a comma-separated list; the first is the canonical
// site, same convention as the verification and reset links.
function frontendCallbackUrl(params) {
  const base = env.CLIENT_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
  const url = new URL(`${base}/oauth/callback`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

// Redirects always carry a 303. A 302/307 can turn the browser's re-POST of
// the callback into a duplicated code exchange on some clients; nobody should
// be re-POSTing here, and 303 says so.
function redirectToFrontend(res, params) {
  res.redirect(303, frontendCallbackUrl(params));
}

// Validates :provider against a fixed list BEFORE it reaches anything that
// builds URLs or queries the database from it.
function parseProvider(req, res, next) {
  const { provider } = req.params;
  if (!PROVIDERS.includes(provider)) {
    return redirectToFrontend(res, {
      error: "This login provider is not supported.",
    });
  }
  req.oauthProvider = provider;
  next();
}

// GET /api/auth/oauth/:provider — the browser is sent to the provider.
const start = asyncHandler(async (req, res) => {
  const authUrl = await oauthService.createState(req.oauthProvider);
  // Fire-and-forget cleanup of expired state rows; see the service.
  oauthService.pruneExpiredStates();
  res.redirect(302, authUrl);
});

// GET /api/auth/oauth/:provider/callback — the provider returns the browser
// here. On success: session created (refresh cookie + one-time exchange code
// for the SPA), user redirected. On failure: redirected with a GENERIC
// message — the provider's error details stay in the server logs.
const callback = asyncHandler(async (req, res) => {
  const provider = req.oauthProvider;

  try {
    const user = await oauthService.handleCallback(provider, {
      code: req.query.code,
      state: req.query.state,
    });

    // Absorb the guest cart while the request still has session cookies.
    await absorbGuestCart(req, res, user.id);

    // Issue a short-lived, single-use exchange code. The SPA lands on
    // /oauth/callback?code=... and immediately POSTs it to /oauth/exchange,
    // which mints the real session tokens. This keeps JWTs out of URLs
    // (browser history, Referer headers, proxy logs).
    const exchangeCode = await oauthService.issueExchangeCode(user.id);

    redirectToFrontend(res, { code: exchangeCode });
  } catch (err) {
    req.log?.warn(
      { provider, err: { message: err.message } },
      "OAuth callback rejected",
    );
    const errorMsg =
      err.statusCode && err.statusCode < 500
        ? err.message
        : "Social login failed. Please try again or use email and password.";
    redirectToFrontend(res, { error: errorMsg });
  }
});

// POST /api/auth/oauth/exchange — the SPA swaps its one-time code for the
// app's session. Sets httpOnly cookies for both access and refresh tokens.
const exchange = asyncHandler(async (req, res) => {
  const result = await oauthService.consumeExchangeCode(req.body.code, {
    issueTokens: (user) => authService.issueTokens(user),
  });

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  await absorbGuestCart(req, res, result.user.id);

  res.json({
    success: true,
    data: {
      user: authService.toPublicUserFromRow(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

module.exports = { parseProvider, start, callback, exchange };
