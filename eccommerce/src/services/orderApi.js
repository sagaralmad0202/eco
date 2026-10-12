import api from "./api";

function generateIdempotencyKey(prefix = "idem") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).slice(2, 10);
  const randomStr2 = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${timestamp}-${randomStr}-${randomStr2}`;
}

export const orderApi = {
  async create({ addressId, couponCode }, idempotencyKey) {
    const key = idempotencyKey || generateIdempotencyKey("ord");
    const response = await api.post(
      "/orders",
      {
        addressId,
        ...(couponCode ? { couponCode } : {}),
      },
      {
        headers: {
          "Idempotency-Key": key,
        },
      },
    );
    return response.data;
  },

  async get(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async history({ page = 1, limit = 50 } = {}) {
    const response = await api.get("/orders/history", {
      params: { page, limit },
    });
    return response.data;
  },

  async cancel(orderId) {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderApi;
