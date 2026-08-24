const express = require("express");
const rateLimit = require("express-rate-limit");

const validate = require("../../middleware/validate");
const { authenticate, optionalAuth } = require("../../middleware/authenticate");
const { loginThrottle } = require("../../middleware/loginThrottle");
const controller = require("./auth.controller");
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

const router = express.Router();

// Login is the single most attacked endpoint in any app. Without a limit,
// an attacker can try thousands of passwords per minute.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many accounts created from this address. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter than login, for a different reason. Each call sends a real email to
// a third party, so an unlimited endpoint is a free spam cannon pointed at
// any address an attacker chooses — and it burns your sending reputation.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many reset requests. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset tokens are 256 bits, so guessing is not the concern — this simply
// stops someone hammering the endpoint with junk tokens.
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many reset attempts. Try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Each call sends an email. Tight limit prevents abuse as a spam relay.
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many verification requests. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  controller.register,
);

// loginLimiter = IP-based, loginThrottle = per-account. Both layers run so
// that neither a single machine nor a botnet can brute-force a password.
router.post(
  "/login",
  loginLimiter,
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
  resendVerificationLimiter,
  authenticate,
  controller.resendVerification,
);

// --- Password recovery (no session required) ---

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  controller.resetPassword,
);

// --- Password change (session required) ---
// Separate from reset on purpose: this one proves identity with the current
// password, the other with a token emailed to the address on file.
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword,
);

module.exports = router;
