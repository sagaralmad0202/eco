const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const {
  authenticate,
  requireVerifiedEmail,
} = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./payment.controller");
const {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} = require("./payment.validators");

// Payments are the financial critical path. Both authentication and email
// verification are required — an unverified account must not be able to
// initiate a payment. The shared limiter runs before either check.
const router = createRateLimitedRouter("/api/payments", {
  middleware: [authenticate, requireVerifiedEmail],
});
router.post(
  "/razorpay/create-order",
  validate(createRazorpayOrderSchema),
  controller.createRazorpayOrder,
);
router.post(
  "/razorpay/verify",
  validate(verifyRazorpayPaymentSchema),
  controller.verifyRazorpayPayment,
);

module.exports = router;
