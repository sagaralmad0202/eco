const env = require("../../config/env");

// Only declared route patterns enter here, never request URLs.
function canonicalOperation(method, route) {
  method = method.toUpperCase();
  if (method === "HEAD") method = "GET";
  route = route.replace(/\/+$/, "") || "/";
  route = route.replace(/^\/api\/account(?=\/|$)/, "/api/users");
  if (route === "/api/users/me/profile") route = "/api/users";
  if (route === "/api/users/me/avatar") route = "/api/users/avatar";
  if (route === "/api/upload/image") route = "/api/upload";
  if (route === "/api/orders/history" && method === "GET")
    route = "/api/orders";
  if (route === "/auth/google/callback")
    route = "/api/auth/oauth/:provider/callback";
  // PUT and PATCH are aliases for this particular profile operation.
  if (route === "/api/users" && method === "PUT") method = "PATCH";
  return { method, route };
}
// Preserve longer auth budgets as additional layers. OAuth start/callback share
// one budget across providers and aliases, as in the original implementation.
const AUTH_BUDGETS = {
  "POST:/api/auth/login": ["login-ip", 10, 15 * 60000],
  "POST:/api/auth/register": ["register-ip", 20, 60 * 60000],
  "POST:/api/auth/forgot-password": ["forgot-password-ip", 5, 60 * 60000],
  "POST:/api/auth/reset-password": ["reset-password-ip", 10, 15 * 60000],
  "POST:/api/auth/resend-verification": [
    "resend-verification-ip",
    5,
    60 * 60000,
  ],
  "GET:/api/auth/oauth/:provider": ["oauth-ip", 30, 15 * 60000],
  "GET:/api/auth/oauth/:provider/callback": ["oauth-ip", 30, 15 * 60000],
  "POST:/api/auth/oauth/exchange": ["oauth-exchange-ip", 20, 15 * 60000],
};
const AUTH_OPERATIONS = new Set([
  "POST:/api/auth/login",
  "POST:/api/auth/register",
  "POST:/api/auth/forgot-password",
  "POST:/api/auth/reset-password",
  "GET:/api/auth/verify-email",
  "POST:/api/auth/resend-verification",
  "POST:/api/auth/change-password",
]);
const EXPENSIVE_OPERATIONS = new Set([
  "POST:/api/orders",
  "POST:/api/payments/razorpay/create-order",
  "POST:/api/payments/razorpay/verify",
  "POST:/api/upload",
  "POST:/api/users/avatar",
]);
const PUBLIC_AUTH = new Set([
  "POST:/api/auth/login",
  "POST:/api/auth/register",
  "POST:/api/auth/forgot-password",
  "POST:/api/auth/reset-password",
  "GET:/api/auth/verify-email",
  "POST:/api/auth/refresh",
  "GET:/api/auth/oauth/:provider",
  "GET:/api/auth/oauth/:provider/callback",
  "POST:/api/auth/oauth/exchange",
]);
function resolvePolicies(method, route) {
  const canonical = canonicalOperation(method, route);
  const operation = `${canonical.method}:${canonical.route}`;
  const write = ["POST", "PUT", "PATCH", "DELETE"].includes(canonical.method);
  let category = write ? "write" : "general";
  if (AUTH_OPERATIONS.has(operation)) category = "auth";
  if (EXPENSIVE_OPERATIONS.has(operation)) category = "expensive";
  const sensitive =
    category === "auth" ||
    category === "expensive" ||
    canonical.route.startsWith("/api/auth/") ||
    (write && canonical.route.startsWith("/api/users"));
  const primary = {
    id: `${category}:${operation}`,
    ...canonical,
    category,
    limit: env[`RATE_LIMIT_${category.toUpperCase()}_MAX_REQUESTS`],
    windowMs: env.RATE_LIMIT_WINDOW_SECONDS * 1000,
    identity:
      PUBLIC_AUTH.has(operation) || route === "unmatched" ? "ip" : "user-or-ip",
    failOpen: sensitive ? false : env.RATE_LIMIT_FAIL_OPEN,
  };
  const budget = AUTH_BUDGETS[operation];
  return budget
    ? [
        primary,
        {
          id: budget[0],
          ...canonical,
          category: "auth",
          limit: budget[1],
          windowMs: budget[2],
          identity: "ip",
          failOpen: false,
        },
      ]
    : [primary];
}
module.exports = { canonicalOperation, resolvePolicies };
