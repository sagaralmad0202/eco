import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../services/authApi";

// Load persisted user & token state
const loadInitialAuthState = () => {
  try {
    // Check URL query parameters for direct OAuth redirect
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("auth_token");
      const urlUser = params.get("auth_user");

      if (urlToken) {
        localStorage.setItem("accessToken", urlToken);
        let parsedUser = null;
        if (urlUser) {
          try {
            parsedUser = JSON.parse(decodeURIComponent(urlUser));
            localStorage.setItem("redux_user", JSON.stringify(parsedUser));
          } catch (e) {
            console.error("Failed to parse auth_user from URL", e);
          }
        }
        // Clean URL bar immediately so user sees only clean path e.g. '/'
        window.history.replaceState({}, document.title, window.location.pathname);

        return {
          user: parsedUser,
          accessToken: urlToken,
          refreshToken: null,
          isAuthenticated: true,
          isInitialized: true,
        };
      }
    }

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("redux_user");

    if (accessToken || refreshToken) {
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isInitialized: false, // Will be confirmed by initializeAuth
      };
    }
  } catch (e) {
    console.error("Failed to load initial auth state from localStorage", e);
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitialized: true,
  };
};

/**
 * Initialize Auth / Restore Session Async Thunk
 */
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    console.log(
      `[Auth] Initializing auth state... (hasAccessToken: ${Boolean(
        accessToken,
      )}, hasRefreshToken: ${Boolean(refreshToken)})`,
    );

    if (!accessToken && !refreshToken) {
      console.log("[Auth] No session found on startup.");
      return { user: null, isAuthenticated: false };
    }

    try {
      console.log("[Auth] Verifying session with /auth/me...");
      const response = await authApi.getMe();
      const user = response.data?.user || response.user;
      console.log("[Auth] Session verified successfully. User:", user?.email);
      if (user) {
        localStorage.setItem("redux_user", JSON.stringify(user));
      }
      return {
        user,
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
        isAuthenticated: true,
      };
    } catch (err) {
      console.warn(
        "[Auth] Session check failed during initialization:",
        err?.message || err,
      );
      const status = err?.status || err?.response?.status;
      if (status === 401 || status === 403) {
        return rejectWithValue({ unauthenticated: true });
      }
      const savedUser = localStorage.getItem("redux_user");
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
        isAuthenticated: Boolean(
          localStorage.getItem("accessToken") ||
            localStorage.getItem("refreshToken"),
        ),
      };
    }
  },
);

/**
 * Signup Async Thunk
 */
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(formData);
      const payload = response.data || response;

      if (payload.accessToken) {
        localStorage.setItem("accessToken", payload.accessToken);
      }
      if (payload.refreshToken) {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }
      if (payload.user) {
        localStorage.setItem("redux_user", JSON.stringify(payload.user));
      }

      return payload;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Login Async Thunk
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const payload = response.data || response;

      if (payload.accessToken) {
        localStorage.setItem("accessToken", payload.accessToken);
      }
      if (payload.user) {
        localStorage.setItem("redux_user", JSON.stringify(payload.user));
      }

      return payload;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Forgot Password Async Thunk
 *
 * Fulfilling means "the request was accepted", NOT "that email exists". The
 * backend answers identically either way so this endpoint cannot be used to
 * enumerate accounts — do not add UI that branches on the outcome.
 */
export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPasswordUser",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword({ email });
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Reset Password Async Thunk
 *
 * `token` is the 64-character value from the emailed link's ?token= parameter,
 * not the user's email. On success the backend revokes every session for that
 * account, so the caller must send the user to /login rather than trying to
 * keep them signed in.
 */
export const resetPasswordUser = createAsyncThunk(
  "auth/resetPasswordUser",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword({ token, password });
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * OAuth Login Async Thunk
 *
 * Takes the one-time code the backend handed to /oauth/callback after a
 * social login and exchanges it for a session. Persists tokens/user exactly
 * like loginUser, so nothing downstream can tell the two logins apart.
 */
export const exchangeOAuthCode = createAsyncThunk(
  "auth/exchangeOAuthCode",
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await authApi.exchangeOAuthCode(code);
      const payload = response.data || response;

      if (payload.accessToken) {
        localStorage.setItem("accessToken", payload.accessToken);
      }
      if (payload.refreshToken) {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }
      if (payload.user) {
        localStorage.setItem("redux_user", JSON.stringify(payload.user));
      }

      return payload;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Logout Async Thunk
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await authApi.logout();
    return { revoked: true };
  } catch (err) {
    console.error("Server logout failed; clearing local session anyway", err);
    return { revoked: false, error: err };
  }
});

const initialAuth = loadInitialAuthState();

const clearAuthState = (state) => {
  state.user = null;
  state.accessToken = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.signupState = { loading: false, success: false, error: null };
  state.loginState = { loading: false, success: false, error: null };
  state.forgotPasswordState = { loading: false, success: false, error: null, message: null };
  state.resetPasswordState = { loading: false, success: false, error: null, message: null };

  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("redux_user");
  } catch (e) {
    console.error("Failed to clear auth storage", e);
  }
};

const initialState = {
  user: initialAuth.user,
  accessToken: initialAuth.accessToken,
  refreshToken: initialAuth.refreshToken,
  isAuthenticated: initialAuth.isAuthenticated,
  isInitialized: initialAuth.isInitialized,
  signupState: {
    loading: false,
    success: false,
    error: null,
  },
  loginState: {
    loading: false,
    success: false,
    error: null,
  },
  forgotPasswordState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  resetPasswordState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  logoutState: {
    loading: false,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user || action.payload;
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isInitialized = true;

      try {
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("redux_user", JSON.stringify(user));
      } catch (e) {
        console.error("Failed to persist auth token", e);
      }
    },
    tokensUpdated: (state, action) => {
      if (action.payload) {
        const { accessToken, refreshToken, user } = action.payload;
        if (accessToken) state.accessToken = accessToken;
        if (refreshToken) state.refreshToken = refreshToken;
        if (user) state.user = user;
        state.isAuthenticated = true;
      } else {
        clearAuthState(state);
      }
      state.isInitialized = true;
    },
    setAuthInitialized: (state, action) => {
      state.isInitialized = action.payload !== undefined ? Boolean(action.payload) : true;
    },
    logout: clearAuthState,
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem("redux_user", JSON.stringify(state.user));
        } catch (e) {
          console.error("Failed to update user storage", e);
        }
      }
    },
    clearSignupState: (state) => {
      state.signupState = { loading: false, success: false, error: null };
    },
    clearLoginState: (state) => {
      state.loginState = { loading: false, success: false, error: null };
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordState = { loading: false, success: false, error: null, message: null };
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordState = { loading: false, success: false, error: null, message: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth Cases
      .addCase(initializeAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.user) state.user = action.payload.user;
        if (action.payload.accessToken) state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isInitialized = true;
        if (action.payload?.unauthenticated) {
          clearAuthState(state);
        }
      })

      // Signup Cases
      .addCase(signupUser.pending, (state) => {
        state.signupState.loading = true;
        state.signupState.success = false;
        state.signupState.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupState.loading = false;
        state.signupState.success = true;
        state.signupState.error = null;

        const payload = action.payload;
        if (payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
        if (payload?.accessToken) state.accessToken = payload.accessToken;
        if (payload?.refreshToken) state.refreshToken = payload.refreshToken;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupState.loading = false;
        state.signupState.success = false;
        state.signupState.error = action.payload || { message: "Signup failed. Please try again." };
      })

      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loginState.loading = true;
        state.loginState.success = false;
        state.loginState.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginState.loading = false;
        state.loginState.success = true;
        state.loginState.error = null;

        const payload = action.payload;
        if (payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
        if (payload?.accessToken) state.accessToken = payload.accessToken;
        if (payload?.refreshToken) state.refreshToken = payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginState.loading = false;
        state.loginState.success = false;
        state.loginState.error = action.payload || { message: "Login failed. Please check your credentials." };
      })

      // OAuth exchange
      .addCase(exchangeOAuthCode.pending, (state) => {
        state.loginState.loading = true;
        state.loginState.success = false;
        state.loginState.error = null;
      })
      .addCase(exchangeOAuthCode.fulfilled, (state, action) => {
        state.loginState.loading = false;
        state.loginState.success = true;
        state.loginState.error = null;

        const payload = action.payload;
        if (payload?.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
        if (payload?.accessToken) state.accessToken = payload.accessToken;
        if (payload?.refreshToken) state.refreshToken = payload.refreshToken;
      })
      .addCase(exchangeOAuthCode.rejected, (state, action) => {
        state.loginState.loading = false;
        state.loginState.success = false;
        state.loginState.error = action.payload || { message: "Social login failed. Please try again." };
      })

      // Forgot Password Cases
      .addCase(forgotPasswordUser.pending, (state) => {
        state.forgotPasswordState.loading = true;
        state.forgotPasswordState.success = false;
        state.forgotPasswordState.error = null;
        state.forgotPasswordState.message = null;
      })
      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.forgotPasswordState.loading = false;
        state.forgotPasswordState.success = true;
        state.forgotPasswordState.error = null;
        state.forgotPasswordState.message = action.payload?.message || "Password reset request submitted.";
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.forgotPasswordState.loading = false;
        state.forgotPasswordState.success = false;
        state.forgotPasswordState.error = action.payload || { message: "Request failed. Try again later." };
      })

      // Reset Password Cases
      .addCase(resetPasswordUser.pending, (state) => {
        state.resetPasswordState.loading = true;
        state.resetPasswordState.success = false;
        state.resetPasswordState.error = null;
        state.resetPasswordState.message = null;
      })
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        state.resetPasswordState.loading = false;
        state.resetPasswordState.success = true;
        state.resetPasswordState.error = null;
        state.resetPasswordState.message = action.payload?.message || "Password updated successfully.";
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.resetPasswordState.loading = false;
        state.resetPasswordState.success = false;
        state.resetPasswordState.error = action.payload || { message: "Reset failed. Invalid or expired token." };
      })

      // Logout Cases
      .addCase(logoutUser.pending, (state) => {
        state.logoutState.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        clearAuthState(state);
        state.logoutState.loading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        clearAuthState(state);
        state.logoutState.loading = false;
      });
  },
});

export const {
  loginSuccess,
  tokensUpdated,
  setAuthInitialized,
  logout,
  updateProfile,
  clearSignupState,
  clearLoginState,
  clearForgotPasswordState,
  clearResetPasswordState,
} = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;

export const selectSignupState = (state) => state.auth.signupState;
export const selectLoginState = (state) => state.auth.loginState;

export const selectForgotPasswordState = (state) => state.auth.forgotPasswordState;
export const selectResetPasswordState = (state) => state.auth.resetPasswordState;

export const selectLogoutLoading = (state) => state.auth.logoutState.loading;

export default authSlice.reducer;

