const express = require("express");
const rateLimit = require("express-rate-limit");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./auth.controller");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
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

module.exports = router;
