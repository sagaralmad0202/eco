const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const { optionalAuth } = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./contact.controller");
const { createContactMessageSchema } = require("./contact.validators");

const router = createRateLimitedRouter("/api/contact");

// Public endpoint with optional authentication.
// Supports both guest users (req.user is undefined/null) and authenticated users.
// If an Authorization Bearer token is provided and valid, req.user is attached.
// The shared route limiter runs before optional authentication and validation.
router.post(
  "/",
  optionalAuth,
  validate(createContactMessageSchema),
  controller.submitContactMessage,
);

module.exports = router;
