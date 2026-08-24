import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../services/authApi";

// Load persisted user & token state
const loadInitialAuthState = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("redux_user");

    if (accessToken) {
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        accessToken,
        refreshToken: null,
        isAuthenticated: true,
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
  };
};

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

      try {
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (user) localStorage.setItem("redux_user", JSON.stringify(user));
      } catch (e) {
        console.error("Failed to persist auth token", e);
      }
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
        }
        if (payload?.accessToken) state.accessToken = payload.accessToken;
        if (payload?.refreshToken) state.refreshToken = payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginState.loading = false;
        state.loginState.success = false;
        state.loginState.error = action.payload || { message: "Login failed. Please check your credentials." };
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
      // The thunk swallows API failures, so this only fires if something
      // outside the request threw — reading localStorage in a locked-down
      // browser, say. Clear the session anyway: a user who asked to log out
      // must not be left signed in, and without this the button would stay
      // stuck on "Logging out…" forever.
      .addCase(logoutUser.rejected, (state) => {
        clearAuthState(state);
        state.logoutState.loading = false;
      });
  },
});

export const {
  loginSuccess,
  logout,
  updateProfile,
  clearSignupState,
  clearLoginState,
  clearForgotPasswordState,
  clearResetPasswordState,
} = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectSignupState = (state) => state.auth.signupState;
export const selectLoginState = (state) => state.auth.loginState;

export const selectForgotPasswordState = (state) => state.auth.forgotPasswordState;
export const selectResetPasswordState = (state) => state.auth.resetPasswordState;

export const selectLogoutLoading = (state) => state.auth.logoutState.loading;

export default authSlice.reducer;
