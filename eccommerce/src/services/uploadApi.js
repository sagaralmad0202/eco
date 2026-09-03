import api from "./api";

/**
 * File Upload API service.
 * Handles single or multiple file uploads to the backend.
 */
const uploadApi = {
  /**
   * Upload an image or general file.
   *
   * @param {File} file - The file object from <input type="file">
   * @param {Object} [options]
   * @param {string} [options.fieldName="file"] - Form data field name ('file', 'image', or 'avatar')
   * @param {string} [options.type] - Optional purpose type (e.g. 'avatar')
   * @returns {Promise<Object>} { success, message, data: { url, publicUrl, filename, size } }
   */
  async uploadFile(file, options = {}) {
    const { fieldName = "file", type } = options;
    const form = new FormData();
    form.append(fieldName, file);
    if (type) {
      form.append("type", type);
    }

    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    const response = await api.post(`/upload${query}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Specifically upload an avatar image.
   *
   * @param {File} file - Image file
   * @returns {Promise<Object>}
   */
  async uploadAvatar(file) {
    return this.uploadFile(file, { fieldName: "avatar", type: "avatar" });
  },
};

export default uploadApi;
