const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const validate = require("../../middleware/validate");
const { authenticate, optionalAuth } = require("../../middleware/authenticate");
const { loginThrottle } = require("../../middleware/loginThrottle");
const controller = require("./auth.controller");
const oauthController = require("./oauth.controller");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} = require("./auth.validators");

// Shared Redis policies enforce each authentication route's IP limits before
// validation, authentication, or account failure checks run.
const router = createRateLimitedRouter("/api/auth");

router.post(
  "/register",
  validate(registerSchema),
  controller.register,
);

// The shared limiter bounds attempts by IP; loginThrottle also protects the
// target account when attempts arrive from multiple source addresses.
router.post(
  "/login",
  validate(loginSchema),
  loginThrottle,
  controller.login,
);

router.post("/refresh", validate(refreshSchema), controller.refresh);

// optionalAuth, not authenticate. Possession of the refresh token is what
// authorises the revocation, and demanding a live access token would mean a
// user whose token just expired could not sign out — leaving a valid refresh
// token in the wild, which is the opposite of what this endpoint is for.
router.post("/logout", optionalAuth, validate(logoutSchema), controller.logout);

router.post("/logout-all", authenticate, controller.logoutAll);

router.get("/me", authenticate, controller.me);

// --- Email verification ---

// GET so an email link opens directly in the browser. The token is in the
// query string, validated by zod.
router.get(
  "/verify-email",
  validate(verifyEmailSchema, "query"),
  controller.verifyEmail,
);

// Requires authentication — only the account holder should be able to trigger
// a resend. Rate-limited to prevent email spam.
router.post(
  "/resend-verification",
  authenticate,
  controller.resendVerification,
);

// --- Password recovery (no session required) ---

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword,
);

// --- Password change (session required) ---
// Separate from reset on purpose: this one proves identity with the current
// password, the other with a token emailed to the address on file.
router.post("/change-password", authenticate, validate(changePasswordSchema), controller.changePassword);

// --- Social login (OAuth 2.0 authorization code flow) ---
//
// Top-level browser navigations, not XHR: the whole point is that the user
// ends up on the provider's page and back. See oauth.controller.js for how
// the callback hands the session to the SPA.
//
// Start and callback share a Redis IP budget across providers and aliases.
// Each legitimate login uses one start and one callback.

router.get(
  "/oauth/:provider",
  oauthController.parseProvider,
  oauthController.start,
);

router.get(
  "/oauth/:provider/callback",
  oauthController.parseProvider,
  oauthController.callback,
);

// Body is a single one-time code that is hashed before lookup; brute force
// at 256 bits is not a concern, the limit just keeps junk off the endpoint.
router.post("/oauth/exchange", oauthController.exchange);

module.exports = router;
