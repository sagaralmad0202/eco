jest.mock("../src/config/env", () => ({
  JWT_ACCESS_SECRET: "test-access-secret-at-least-32-characters",
  JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-characters",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
}));

const jwt = require("jsonwebtoken");
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../src/utils/jwt");

describe("JWT algorithm pinning", () => {
  const user = { id: "user-123", role: "CUSTOMER" };

  test("signAccessToken produces a valid HS256 token", () => {
    const token = signAccessToken(user);
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header.alg).toBe("HS256");
  });

  test("signRefreshToken produces a valid HS256 token", () => {
    const token = signRefreshToken(user);
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header.alg).toBe("HS256");
  });

  test("verifyAccessToken rejects a token signed with 'none' algorithm", () => {
    // Craft a token with alg: "none" — the classic algorithm confusion attack.
    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, "", { algorithm: "none" });

    expect(() => verifyAccessToken(token)).toThrow();
  });

  test("verifyRefreshToken rejects a token signed with 'none' algorithm", () => {
    const payload = { sub: user.id, type: "refresh" };
    const token = jwt.sign(payload, "", { algorithm: "none" });

    expect(() => verifyRefreshToken(token)).toThrow();
  });

  test("verifyAccessToken accepts a properly signed HS256 token", () => {
    const token = signAccessToken(user);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(user.id);
    expect(payload.role).toBe(user.role);
  });

  test("verifyRefreshToken accepts a properly signed HS256 token", () => {
    const token = signRefreshToken(user);
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe(user.id);
    expect(payload.type).toBe("refresh");
  });
});
