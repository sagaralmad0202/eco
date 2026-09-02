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
   * Refresh the access and refresh token pair.
   * @param {string} [refreshToken]
   * @returns {Promise<Object>} Backend response data { accessToken, refreshToken }
   */
  async refresh(refreshToken) {
    const token =
      refreshToken ||
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null);
    const response = await api.post(
      "/auth/refresh",
      token ? { refreshToken: token } : {}
    );
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
    const token =
      refreshToken ||
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null);
    const response = await api.post(
      "/auth/logout",
      token ? { refreshToken: token } : {}
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

  /**
   * Swap the one-time code from a social-login redirect for real tokens.
   *
   * The backend's OAuth callback redirects here with ?code=; that code is
   * single-use, expires in minutes, and is the ONLY thing that ever appears
   * in a URL — access/refresh tokens arrive in this POST's response body.
   *
   * @param {string} code - one-time exchange code from /oauth/callback
   * @returns {Promise<Object>} { user, accessToken, refreshToken }
   */
  async exchangeOAuthCode(code) {
    const response = await api.post("/auth/oauth/exchange", { code });
    return response.data;
  },
};

export default authApi;
