const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export function signupUser(email, password) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser() {
  const token = localStorage.getItem("token");
  return request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
