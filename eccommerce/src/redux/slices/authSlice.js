import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../services/authApi";
import { clearStoredSession, setAccessToken, getAccessToken } from "../../services/api";

// Initial auth state: held in memory, session restored on mount via initializeAuth
const loadInitialAuthState = () => {
  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false, // Confirmed on startup by initializeAuth
  };
};

/**
 * Initialize Auth / Restore Session Async Thunk
 *
 * Checks session with the backend. Restores user and access token.
 */
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    console.log("[Auth] Initializing session...");

    try {
      const response = await authApi.getMe();
      const user = response.data?.user || response.user;
      const token = response.data?.accessToken || response.accessToken;
      if (token) {
        setAccessToken(token);
      }
      console.log("[Auth] Session active. Current user:", user?.email);
      return {
        user: user || null,
        accessToken: token || getAccessToken() || null,
        isAuthenticated: true,
      };
    } catch (err) {
      console.log("[Auth] No active session on startup:", err?.message || err);
      clearStoredSession();
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
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
      return response.data || response;
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
      return response.data || response;
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
 * Swaps one-time code for an HttpOnly cookie-authenticated session.
 */
export const exchangeOAuthCode = createAsyncThunk(
  "auth/exchangeOAuthCode",
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await authApi.exchangeOAuthCode(code);
      return response.data || response;
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
  state.isAuthenticated = false;
  state.signupState = { loading: false, success: false, error: null };
  state.loginState = { loading: false, success: false, error: null };
  state.forgotPasswordState = { loading: false, success: false, error: null, message: null };
  state.resetPasswordState = { loading: false, success: false, error: null, message: null };

  clearStoredSession();
};

const initialState = {
  user: initialAuth.user,
  accessToken: initialAuth.accessToken,
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
      const payload = action.payload;
      const user = payload?.data?.user || payload?.user || payload;
      const token = payload?.data?.accessToken || payload?.accessToken;
      if (token) {
        setAccessToken(token);
        state.accessToken = token;
      }
      state.user = user || null;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    tokensUpdated: (state, action) => {
      if (action.payload) {
        if (action.payload.user) state.user = action.payload.user;
        const token = action.payload.accessToken || action.payload.data?.accessToken;
        if (token) {
          setAccessToken(token);
          state.accessToken = token;
        }
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
        state.user = action.payload.user || null;
        state.accessToken = action.payload.accessToken || null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
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
        const token = payload?.data?.accessToken || payload?.accessToken;
        if (token) {
          setAccessToken(token);
          state.accessToken = token;
        }
        const user = payload?.data?.user || payload?.user;
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
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
        const token = payload?.data?.accessToken || payload?.accessToken;
        if (token) {
          setAccessToken(token);
          state.accessToken = token;
        }
        const user = payload?.data?.user || payload?.user;
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
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
        const token = payload?.data?.accessToken || payload?.accessToken;
        if (token) {
          setAccessToken(token);
          state.accessToken = token;
        }
        const user = payload?.data?.user || payload?.user;
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          state.isInitialized = true;
        }
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
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;

export const selectSignupState = (state) => state.auth.signupState;
export const selectLoginState = (state) => state.auth.loginState;

export const selectForgotPasswordState = (state) => state.auth.forgotPasswordState;
export const selectResetPasswordState = (state) => state.auth.resetPasswordState;

export const selectLogoutLoading = (state) => state.auth.logoutState.loading;

export default authSlice.reducer;

