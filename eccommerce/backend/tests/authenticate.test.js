jest.mock("../src/lib/prisma", () => ({
  user: { findUnique: jest.fn() },
}));

jest.mock("../src/utils/jwt", () => ({
  verifyAccessToken: jest.fn(),
}));

const prisma = require("../src/lib/prisma");
const { verifyAccessToken } = require("../src/utils/jwt");
const { optionalAuth } = require("../src/middleware/authenticate");

function runOptionalAuth(headers = {}) {
  const req = { headers };
  return new Promise((resolve) => {
    optionalAuth(req, {}, (error) => resolve({ error, req }));
  });
}

describe("optionalAuth", () => {
  beforeEach(() => jest.clearAllMocks());

  test("allows a true guest request with no bearer token", async () => {
    const result = await runOptionalAuth();

    expect(result.error).toBeUndefined();
    expect(result.req.user).toBeUndefined();
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  test("returns 401 for an expired bearer token so the client can refresh", async () => {
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
