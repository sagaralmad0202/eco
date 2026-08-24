import api from "./api";

export const authApi = {
  /**
   * Register a new user account.
   * @param {Object} userData - { fullName, email, password, phone }
   * @returns {Promise<Object>} Backend response data { user, accessToken, refreshToken }
   */
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Log in an existing user.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Backend response data { user, accessToken, refreshToken }
   */
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Fetch current authenticated user profile.
   * @returns {Promise<Object>} { user }
   */
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Revoke the current session on the server.
   *
   * The refresh token is what the backend revokes, so it is read from storage
   * when the caller does not supply one. Sending no token is still a valid
   * request — the backend falls back to the bearer token's identity.
   *
   * @param {string} [refreshToken]
   * @returns {Promise<Object>} { success, message }
   */
  async logout(refreshToken) {
    const response = await api.post(
      "/auth/logout",
      refreshToken ? { refreshToken } : {}
    );
    return response.data;
  },

  /**
   * Request a password reset link.
   *
   * Always resolves for any syntactically valid email, whether or not an
   * account exists — the backend answers identically on purpose so this
   * endpoint cannot be used to discover who has an account. Do not add any
   * caller-side branching that would undo that.
   *
   * @param {Object} payload - { email }
   * @returns {Promise<Object>} { success, message }
   */
  async forgotPassword({ email }) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Complete a password reset using the token from the emailed link.
   *
   * On success every existing session for that account is revoked server-side,
   * so the user must log in again with the new password.
   *
   * @param {Object} payload - { token, password }
   * @returns {Promise<Object>} { success, message }
   */
  async resetPassword({ token, password }) {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  },
};

export default authApi;
