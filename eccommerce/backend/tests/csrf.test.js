const { csrfProtection } = require("../src/middleware/csrf");

describe("csrfProtection middleware", () => {
  const allowedOrigin = "http://localhost:5173";

  function runCsrf(req) {
    const res = {};
    return new Promise((resolve) => {
      csrfProtection(req, res, (error) => resolve({ error, req }));
    });
  }

  test("allows safe HTTP methods (GET, HEAD, OPTIONS) without origin or custom header", async () => {
    const req = {
      method: "GET",
      originalUrl: "/api/products",
      headers: {},
      cookies: {},
    };
    const result = await runCsrf(req);
    expect(result.error).toBeUndefined();
  });

  test("allows exempt webhook paths", async () => {
    const req = {
      method: "POST",
      originalUrl: "/api/payments/webhook",
      headers: {},
      cookies: {},
    };
    const result = await runCsrf(req);
    expect(result.error).toBeUndefined();
  });

  test("allows mutating request with valid Origin and X-Requested-With header", async () => {
    const req = {
      method: "POST",
      originalUrl: "/api/auth/login",
      headers: {
        origin: allowedOrigin,
        "x-requested-with": "XMLHttpRequest",
      },
      cookies: { accessToken: "some-cookie" },
    };
    const result = await runCsrf(req);
    expect(result.error).toBeUndefined();
  });

  test("rejects mutating request with untrusted Origin", async () => {
    const req = {
      method: "POST",
      originalUrl: "/api/auth/login",
      headers: {
        origin: "https://evil-attacker.com",
        "x-requested-with": "XMLHttpRequest",
      },
      cookies: { accessToken: "some-cookie" },
    };
    const result = await runCsrf(req);
    expect(result.error).toBeDefined();
    expect(result.error.statusCode).toBe(403);
    expect(result.error.message).toContain("CSRF protection: request origin not allowed");
  });

  test("rejects mutating request missing custom anti-CSRF header when cookies are present", async () => {
    const req = {
      method: "POST",
      originalUrl: "/api/cart/items",
      headers: {
        origin: allowedOrigin,
      },
      cookies: { accessToken: "some-cookie" },
    };
    const result = await runCsrf(req);
    expect(result.error).toBeDefined();
    expect(result.error.statusCode).toBe(403);
    expect(result.error.message).toContain("CSRF protection: missing anti-CSRF request header");
  });
});
