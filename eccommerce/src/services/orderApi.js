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
};

export default orderApi;
