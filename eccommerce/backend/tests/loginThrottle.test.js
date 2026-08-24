jest.mock("../src/config/env", () => ({
  LOGIN_MAX_ATTEMPTS: 3,
  LOGIN_WINDOW_MS: 60 * 1000, // 1 minute
  LOGIN_BLOCK_DURATION_MS: 30 * 1000, // 30 seconds
}));

const {
  loginThrottle,
  recordLoginFailure,
  clearLoginFailures,
  _resetStore,
} = require("../src/middleware/loginThrottle");

function runThrottle(email) {
  const req = { body: { email } };
  const res = { setHeader: jest.fn() };
  return new Promise((resolve) => {
    loginThrottle(req, res, (error) => resolve({ error, req, res }));
  });
}

describe("loginThrottle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetStore();
  });

  test("allows the first request for an unknown email", async () => {
    const result = await runThrottle("test@example.com");
    expect(result.error).toBeUndefined();
  });

  test("allows requests when failures are below threshold", async () => {
    recordLoginFailure("test@example.com");
    recordLoginFailure("test@example.com");

    const result = await runThrottle("test@example.com");
    expect(result.error).toBeUndefined();
  });

  test("blocks the account after reaching the failure threshold", async () => {
    for (let i = 0; i < 3; i++) {
      recordLoginFailure("blocked@example.com");
    }

    const result = await runThrottle("blocked@example.com");
    expect(result.error).toBeDefined();
    expect(result.error.statusCode).toBe(429);
    expect(result.res.setHeader).toHaveBeenCalledWith(
      "Retry-After",
      expect.any(Number),
    );
  });

  test("normalises email to lowercase", async () => {
    for (let i = 0; i < 3; i++) {
      recordLoginFailure("Test@Example.COM");
    }

    const result = await runThrottle("test@example.com");
    expect(result.error).toBeDefined();
    expect(result.error.statusCode).toBe(429);
  });

  test("clearLoginFailures resets the counter", async () => {
    for (let i = 0; i < 3; i++) {
      recordLoginFailure("clear-me@example.com");
    }

    clearLoginFailures("clear-me@example.com");

    const result = await runThrottle("clear-me@example.com");
    expect(result.error).toBeUndefined();
  });

  test("does not block a different account", async () => {
    for (let i = 0; i < 3; i++) {
      recordLoginFailure("attacker@example.com");
    }

    const result = await runThrottle("innocent@example.com");
    expect(result.error).toBeUndefined();
  });

  test("allows the request when no email is in the body", async () => {
    const req = { body: {} };
    const res = { setHeader: jest.fn() };
    const result = await new Promise((resolve) => {
      loginThrottle(req, res, (error) => resolve({ error }));
    });
    expect(result.error).toBeUndefined();
  });
});
