const express = require("express");

const { optionalAuth } = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./contact.controller");
const { createContactMessageSchema } = require("./contact.validators");

const router = express.Router();

// Public endpoint with optional authentication.
// Supports both guest users (req.user is undefined/null) and authenticated users.
// If an Authorization Bearer token is provided and valid, req.user is attached.
// Rate limiting is handled by the global sliding-window rate limiter (write tier: 30 requests / 60s).
router.post(
  "/",
  optionalAuth,
  validate(createContactMessageSchema),
  controller.submitContactMessage,
);

module.exports = router;
