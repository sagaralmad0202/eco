import api from "./api";

export const orderApi = {
  async create({ addressId, couponCode }) {
    const response = await api.post("/orders", {
      addressId,
      ...(couponCode ? { couponCode } : {}),
    });
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
