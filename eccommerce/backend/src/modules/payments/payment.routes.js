const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const {
  authenticate,
  requireVerifiedEmail,
} = require("../../middleware/authenticate");
const { idempotency } = require("../../middleware/idempotency");
const validate = require("../../middleware/validate");
const controller = require("./payment.controller");
const {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} = require("./payment.validators");

// Payments are the financial critical path. Both authentication and email
// verification are required — an unverified account must not be able to
// initiate a payment. The shared limiter runs before either check.
//
// Idempotency is enforced on both endpoints: creating a Razorpay order and
// verifying a payment are both one-shot operations where duplicate execution
// can cause financial inconsistency.
const router = createRateLimitedRouter("/api/payments", {
  middleware: [authenticate, requireVerifiedEmail],
});
router.post(
  "/razorpay/create-order",
  idempotency(),
  validate(createRazorpayOrderSchema),
  controller.createRazorpayOrder,
);
router.post(
  "/razorpay/verify",
  idempotency(),
  validate(verifyRazorpayPaymentSchema),
  controller.verifyRazorpayPayment,
);

module.exports = router;

