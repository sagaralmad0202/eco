const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./payment.controller");
const {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} = require("./payment.validators");

const router = express.Router();

router.use(authenticate);
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
