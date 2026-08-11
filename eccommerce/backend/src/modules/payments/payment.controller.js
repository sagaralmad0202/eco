const asyncHandler = require("../../utils/asyncHandler");
const paymentService = require("./payment.service");

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(
    req.user.id,
    req.body.orderId,
  );

  res.status(result.created ? 201 : 200).json({
    success: true,
    message: result.reconciled
      ? "Captured payment reconciled and order confirmed"
      : result.created
        ? "Razorpay order created successfully"
        : "Existing Razorpay order returned",
    data: result,
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyRazorpayPayment(
    req.user.id,
    req.body,
  );

  if (result.stockFailure) {
    return res.status(409).json({
      success: false,
      message:
        "Payment was captured, but stock is unavailable. The order was cancelled and requires a refund.",
      data: result,
    });
  }

  return res.status(result.confirmed ? 200 : 202).json({
    success: true,
    message: result.confirmed
      ? "Payment verified and order confirmed"
      : "Payment is verified but still awaiting capture",
    data: result,
  });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
