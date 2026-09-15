import api from "./api";

export const addressApi = {
  async list() {
    const response = await api.get("/addresses");
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/addresses", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.patch(`/addresses/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};

export default addressApi;
