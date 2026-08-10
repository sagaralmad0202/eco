import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  // Required by the guest cart. The server identifies anonymous shoppers with
  // an httpOnly `cart_session` cookie, which the browser will not attach to a
  // cross-origin request (5173 -> 5000) unless this is set. Without it the
  // server mints a fresh session on every call and the cart appears to empty
  // itself between requests.
  withCredentials: true,
});

// Request Interceptor: Attach bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error payloads
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
        if (data.errors && Array.isArray(data.errors)) {
          fieldErrors = data.errors;
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
  }
);

export default api;
