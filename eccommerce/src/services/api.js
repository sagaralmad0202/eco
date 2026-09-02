import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  // Required by the guest cart and refresh cookies. The server identifies shoppers with
  // httpOnly cookies which requires withCredentials: true.
  withCredentials: true,
});

let refreshRequest = null;
const authChangeListeners = new Set();

export function onAuthChange(listener) {
  authChangeListeners.add(listener);
  return () => authChangeListeners.delete(listener);
}

function notifyAuthChange(tokens) {
  authChangeListeners.forEach((listener) => {
    try {
      listener(tokens);
    } catch (e) {
      console.error("[Auth] Listener error", e);
    }
  });
}

export function clearStoredSession() {
  console.log("[Auth] Clearing stored session tokens and user data");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("redux_user");
  notifyAuthChange(null);
}

export async function refreshAccessToken() {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  console.log(
    `[Auth] Initiating token refresh (hasRefreshToken: ${Boolean(
      storedRefreshToken,
    )})`,
  );

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
      withCredentials: true,
    },
  );

  const tokens = response.data?.data;
  if (!tokens?.accessToken) {
    throw new Error("The refresh response did not include an access token");
  }

  console.log("[Auth] Token refresh successful. Updating local session.");
  localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  notifyAuthChange(tokens);
  return tokens.accessToken;
}

// Request Interceptor: Attach bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s, token refresh queue, and error standardization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/oauth/") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password");

    const is401 = error.response?.status === 401;
    const canRefresh =
      is401 &&
      originalRequest &&
      !originalRequest._retriedAfterRefresh &&
      !isAuthRequest;

    if (canRefresh) {
      originalRequest._retriedAfterRefresh = true;
      console.log(
        `[Auth] 401 detected on ${originalRequest.url}. Queuing refresh request...`,
      );

      try {
        if (!refreshRequest) {
          refreshRequest = refreshAccessToken().finally(() => {
            refreshRequest = null;
          });
        }
        const accessToken = await refreshRequest;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.warn("[Auth] Refresh token expired or invalid:", refreshErr.message);

        // Only clear session and redirect if the refresh request genuinely failed on auth (400, 401, 403)
        const isAuthFailure =
          refreshErr.response?.status === 400 ||
          refreshErr.response?.status === 401 ||
          refreshErr.response?.status === 403;

        if (isAuthFailure) {
          clearStoredSession();
          const publicPaths = [
            "/login",
            "/signup",
            "/forgot-password",
            "/reset-password",
            "/oauth/callback",
          ];
          const isPublicPage = publicPaths.some((p) =>
            window.location.pathname.startsWith(p),
          );
          if (!isPublicPage) {
            console.log(
              `[Auth] Redirecting unauthenticated user from ${window.location.pathname} to /login`,
            );
            window.location.assign("/login");
          }
        }
        return Promise.reject(refreshErr);
      }
    }

    let errorMessage = "An unexpected error occurred. Please try again.";
    let fieldErrors = null;

    if (error.response) {
      const data = error.response.data;
      if (data) {
        if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === "string") {
          errorMessage = data;
        }
        const validationDetails = Array.isArray(data.details)
          ? data.details
          : data.errors;
        if (Array.isArray(validationDetails)) {
          fieldErrors = validationDetails;
        }
      }
    } else if (error.request) {
      errorMessage = "Network error: Unable to connect to backend server.";
    } else {
      errorMessage = error.message;
    }

    return Promise.reject({
      message: errorMessage,
      fieldErrors,
      status: error.response ? error.response.status : null,
      raw: error,
    });
  },
);

export default api;

