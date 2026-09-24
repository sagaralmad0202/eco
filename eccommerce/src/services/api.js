import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
  // Required so the browser attaches HttpOnly session and refresh cookies automatically.
  withCredentials: true,
});

// Access token is held in-memory only (never in localStorage to prevent XSS exposure).
let currentAccessToken = null;

// Clean up any historical tokens stored in localStorage from previous versions
try {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
} catch (e) {
  // Ignore storage errors
}

let refreshRequest = null;
const authChangeListeners = new Set();

export function setAccessToken(token) {
  currentAccessToken = token || null;
  // Ensure token is never persisted in localStorage
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (e) {
    // Ignore storage errors
  }
}

export function getAccessToken() {
  return currentAccessToken;
}

export function onAuthChange(listener) {
  authChangeListeners.add(listener);
  return () => authChangeListeners.delete(listener);
}

function notifyAuthChange(state) {
  authChangeListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error("[Auth] Listener error", e);
    }
  });
}

export function clearStoredSession() {
  console.log("[Auth] Clearing stored session tokens and user data");
  currentAccessToken = null;
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("redux_user");
  } catch (e) {
    // Ignore storage errors
  }
  notifyAuthChange(null);
}

export async function refreshAccessToken() {
  console.log("[Auth] Initiating token refresh");

  // The refresh token is carried automatically by the httpOnly cookie
  // (withCredentials: true). The backend responds by setting fresh
  // httpOnly accessToken and refreshToken cookies and returning the new tokens.
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      timeout: 15000,
      withCredentials: true,
    },
  );

  const newToken =
    response.data?.data?.accessToken ||
    response.data?.accessToken ||
    null;

  if (newToken) {
    setAccessToken(newToken);
  }

  notifyAuthChange({ isAuthenticated: true, accessToken: newToken });
  return response.data;
}

// Request Interceptor: Ensure anti-CSRF and Authorization Bearer headers are set
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    const isPublicAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/forgot-password") ||
      config.url?.includes("/auth/reset-password");

    const token = getAccessToken();
    if (token && !isPublicAuthEndpoint) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s, token refresh queue, and error standardization
api.interceptors.response.use(
  (response) => {
    const tokenFromHeader = response.headers?.["x-access-token"];
    if (tokenFromHeader) {
      setAccessToken(tokenFromHeader);
    }
    return response;
  },
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
        await refreshRequest;
        const freshToken = getAccessToken();
        if (freshToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${freshToken}`;
        }
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
      if (error.response.status === 429) {
        const retryAfter =
          error.response.headers?.["retry-after"] || data?.retryAfter;
        errorMessage = retryAfter
          ? `Too many requests. Please try again in ${retryAfter} seconds.`
          : data?.message || "Too many requests. Please try again later.";
      } else if (data) {
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
      errorMessage = "We’re having trouble loading this content.";
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

