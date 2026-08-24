const express = require("express");

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

const router = express.Router();

// Payments are the financial critical path. Both authentication and email
// verification are required — an unverified account must not be able to
// initiate a payment.
router.use(authenticate, requireVerifiedEmail);
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
