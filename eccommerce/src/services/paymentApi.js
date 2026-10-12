import api from "./api";

function generateIdempotencyKey(prefix = "pay") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).slice(2, 10);
  const randomStr2 = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${timestamp}-${randomStr}-${randomStr2}`;
}

export const paymentApi = {
  async createRazorpayOrder(orderId, idempotencyKey) {
    const key = idempotencyKey || `rzp-ord-${orderId}`;
    const response = await api.post(
      "/payments/razorpay/create-order",
      {
        orderId,
      },
      {
        headers: {
          "Idempotency-Key": key,
        },
      },
    );
    return response.data;
  },

  async verifyRazorpayPayment(payload, idempotencyKey) {
    const key =
      idempotencyKey ||
      (payload.razorpayPaymentId
        ? `vfy-${payload.razorpayPaymentId}`
        : generateIdempotencyKey("vfy"));
    const response = await api.post("/payments/razorpay/verify", payload, {
      headers: {
        "Idempotency-Key": key,
      },
    });
    return response.data;
  },
};

export default paymentApi;
