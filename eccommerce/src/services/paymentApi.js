import api from "./api";

export const paymentApi = {
  async createRazorpayOrder(orderId) {
    const response = await api.post("/payments/razorpay/create-order", {
      orderId,
    });
    return response.data;
  },

  async verifyRazorpayPayment(payload) {
    const response = await api.post("/payments/razorpay/verify", payload);
    return response.data;
  },
};

export default paymentApi;
