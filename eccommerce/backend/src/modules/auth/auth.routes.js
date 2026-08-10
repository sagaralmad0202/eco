const express = require("express");
const rateLimit = require("express-rate-limit");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./auth.controller");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
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

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  controller.register
);

router.post("/login", loginLimiter, validate(loginSchema), controller.login);

router.post("/refresh", validate(refreshSchema), controller.refresh);

router.post("/logout", validate(refreshSchema), controller.logout);

router.post("/logout-all", authenticate, controller.logoutAll);

router.get("/me", authenticate, controller.me);

// --- Password recovery (no session required) ---

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  controller.resetPassword
);

// --- Password change (session required) ---
// Separate from reset on purpose: this one proves identity with the current
// password, the other with a token emailed to the address on file.
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword
);

module.exports = router;
