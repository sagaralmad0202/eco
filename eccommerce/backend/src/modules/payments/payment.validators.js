const { z } = require("zod");

const razorpayId = (prefix, label) =>
  z
    .string()
    .trim()
    .regex(new RegExp(`^${prefix}_[A-Za-z0-9]+$`), `Not a valid ${label}`);

const createRazorpayOrderSchema = z.object({
  orderId: z.string().uuid("Not a valid order id"),
});

const verifyRazorpayPaymentSchema = z.object({
  orderId: z.string().uuid("Not a valid order id"),
  razorpayPaymentId: razorpayId("pay", "Razorpay payment id"),
  razorpayOrderId: razorpayId("order", "Razorpay order id"),
  razorpaySignature: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/i, "Not a valid Razorpay signature"),
});

module.exports = {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
};
