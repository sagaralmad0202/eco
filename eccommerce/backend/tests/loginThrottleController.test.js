jest.mock("../src/modules/auth/auth.service", () => ({ login: jest.fn() }));
jest.mock("../src/modules/cart/cart.service", () => ({
  mergeGuestCart: jest.fn(),
}));
jest.mock("../src/middleware/loginThrottle", () => ({
  completeLoginAttempt: jest.fn(),
}));

const authService = require("../src/modules/auth/auth.service");
const { completeLoginAttempt } = require("../src/middleware/loginThrottle");
const { login } = require("../src/modules/auth/auth.controller");
const ApiError = require("../src/utils/ApiError");

function invokeLogin() {
  const req = {
    body: { email: "test@example.com", password: "secret" },
    cookies: {},
  };
  let done;
  const completed = new Promise((resolve) => {
    done = resolve;
  });
  const res = {
    setHeader: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn((body) => {
      done({ body });
    }),
  };
  const next = jest.fn((error) => {
    done({ error });
  });
  login(req, res, next);
  return { req, res, next, completed };
}

describe("login reservation completion", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    completeLoginAttempt.mockResolvedValue(undefined);
  });

  test.each([401, 403, 500, 503])(
    "finishes status %s with the correct outcome and preserves its error",
    async (status) => {
      const original = new ApiError(status, "Original authentication outcome");
      authService.login.mockRejectedValue(original);
      const invocation = invokeLogin();
      const result = await invocation.completed;
      expect(completeLoginAttempt).toHaveBeenCalledWith(
        invocation.req,
        [401, 403].includes(status) ? "failure" : "release",
      );
      expect(result.error).toBe(original);
      expect(invocation.res.cookie).not.toHaveBeenCalled();
    },
  );

  test("waits for Redis success finalization before issuing response cookies", async () => {
    const loginResult = {
      user: { id: "customer" },
      refreshToken: "test-token",
    };
    authService.login.mockResolvedValue(loginResult);
    let release;
    completeLoginAttempt.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const invocation = invokeLogin();
    await Promise.resolve();
    expect(completeLoginAttempt).toHaveBeenCalledWith(
      invocation.req,
      "success",
    );
    expect(invocation.res.cookie).not.toHaveBeenCalled();
    expect(invocation.res.json).not.toHaveBeenCalled();
    release();
    const result = await invocation.completed;
    expect(result.body).toEqual({ success: true, data: loginResult });
    expect(invocation.res.cookie).toHaveBeenCalledTimes(1);
  });

  test.each(["success", "failure"])(
    "returns 503 when Redis cannot finalize %s",
    async (outcome) => {
      if (outcome === "success") {
        authService.login.mockResolvedValue({
          user: { id: "customer" },
          refreshToken: "token",
        });
      } else {
        authService.login.mockRejectedValue(
          ApiError.unauthorized("Wrong credentials"),
        );
      }
      const unavailable = ApiError.serviceUnavailable(
        "Login protection unavailable",
      );
      completeLoginAttempt.mockRejectedValue(unavailable);
      const invocation = invokeLogin();
      expect((await invocation.completed).error).toBe(unavailable);
      expect(invocation.res.setHeader).toHaveBeenCalledWith("Retry-After", 1);
      expect(invocation.res.cookie).not.toHaveBeenCalled();
    },
  );
});

test("Redis completion outages use the shared 503 envelope without error-stack disclosure", () => {
  const { errorHandler } = require("../src/middleware/errorHandler");
  const error = ApiError.serviceUnavailable();
  error.rateLimitUnavailable = true;
  const req = { id: "outage-request", log: { error: jest.fn() } };
  const res = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  errorHandler(error, req, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(503);
  expect(res.setHeader).toHaveBeenCalledWith("Retry-After", 1);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Service temporarily unavailable. Please try again later.",
    retryAfter: 1,
    requestId: "outage-request",
  });
  expect(req.rateLimitHandled).toBe(true);
  expect(req.log.error).not.toHaveBeenCalled();
});
