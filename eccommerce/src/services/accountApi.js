import api from "./api";

const accountApi = {
  /**
   * Fetch the authenticated user's full profile.
   * @returns {Promise<Object>} { success, data: { user } }
   */
  async getProfile() {
    const response = await api.get("/users/me/profile");
    return response.data;
  },

  /**
   * Partially update the authenticated user's profile.
   * Only the fields present in `data` are changed; omitted fields stay as-is.
   *
   * @param {Object} data — any subset of { fullName, phone, dateOfBirth, gender, address, aboutYou }
   * @returns {Promise<Object>} { success, message, data: { user } }
   */
  async updateProfile(data) {
    const response = await api.patch("/users/me/profile", data);
    return response.data;
  },

  /**
   * Upload a new avatar image for the authenticated user.
   *
   * @param {File} file — the image File from an <input type="file">
   * @returns {Promise<Object>} { success, message, data }
   */
  async uploadAvatar(file) {
    const form = new FormData();
    form.append("avatar", file);

    const response = await api.post("/upload?type=avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * General file upload endpoint.
   *
   * @param {File} file
   * @param {Object} [options]
   */
  async uploadFile(file, options = {}) {
    const { fieldName = "file", type } = options;
    const form = new FormData();
    form.append(fieldName, file);
    if (type) form.append("type", type);
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    const response = await api.post(`/upload${query}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default accountApi;
