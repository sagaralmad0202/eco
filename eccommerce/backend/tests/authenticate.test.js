jest.mock("../src/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
}));

jest.mock("../src/utils/jwt", () => ({
  verifyAccessToken: jest.fn(),
}));

const prisma = require("../src/lib/prisma");
const { verifyAccessToken } = require("../src/utils/jwt");
const { optionalAuth, authenticate } = require("../src/middleware/authenticate");

function runOptionalAuth(headers = {}, cookies = {}) {
  const req = { headers, cookies };
  return new Promise((resolve) => {
    optionalAuth(req, {}, (error) => resolve({ error, req }));
  });
}

function runAuthenticate(headers = {}, cookies = {}) {
  const req = { headers, cookies };
  return new Promise((resolve) => {
    authenticate(req, {}, (error) => resolve({ error, req }));
  });
}

describe("authenticate & optionalAuth with cookies and headers", () => {
  beforeEach(() => jest.clearAllMocks());

  test("allows a true guest request with no bearer token or cookie", async () => {
    const result = await runOptionalAuth();

    expect(result.error).toBeUndefined();
    expect(result.req.user).toBeUndefined();
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  test("authenticates user from HttpOnly cookie", async () => {
    const user = { id: "user-cookie", isActive: true };
    verifyAccessToken.mockReturnValue({ sub: user.id });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await runAuthenticate({}, { accessToken: "valid-cookie-token" });

    expect(result.error).toBeUndefined();
    expect(result.req.user).toEqual(user);
    expect(verifyAccessToken).toHaveBeenCalledWith("valid-cookie-token");
  });

  test("falls back to Authorization bearer header if cookie is absent", async () => {
    const user = { id: "user-bearer", isActive: true };
    verifyAccessToken.mockReturnValue({ sub: user.id });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await runAuthenticate({ authorization: "Bearer valid-bearer-token" }, {});

    expect(result.error).toBeUndefined();
    expect(result.req.user).toEqual(user);
    expect(verifyAccessToken).toHaveBeenCalledWith("valid-bearer-token");
  });

  test("returns 401 when authenticate is called without token or cookie", async () => {
    const result = await runAuthenticate({}, {});

    expect(result.error).toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: "Missing access token",
      }),
    );
  });

  test("returns 401 for an expired bearer token or cookie so the client can refresh", async () => {
    const expired = new Error("expired");
    expired.name = "TokenExpiredError";
    verifyAccessToken.mockImplementation(() => {
      throw expired;
    });

    const result = await runOptionalAuth({ authorization: "Bearer expired" });

    expect(result.error).toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: "Access token expired",
      }),
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test("attaches an active user for a valid bearer token", async () => {
    const user = { id: "user-1", isActive: true };
    verifyAccessToken.mockReturnValue({ sub: user.id });
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await runOptionalAuth({ authorization: "Bearer valid" });

    expect(result.error).toBeUndefined();
    expect(result.req.user).toEqual(user);
  });
});

