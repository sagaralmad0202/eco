jest.mock("../src/lib/prisma", () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
  emailVerificationToken: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock("../src/lib/mailer", () => ({
  sendPasswordResetEmail: jest.fn(),
  sendVerificationEmail: jest.fn().mockResolvedValue({ delivered: true }),
}));

jest.mock("../src/utils/jwt", () => ({
  signAccessToken: jest.fn().mockReturnValue("mock-access"),
  signRefreshToken: jest.fn().mockReturnValue("mock-refresh"),
  verifyRefreshToken: jest.fn(),
  hashToken: jest.fn((t) => `hashed_${t}`),
  expiryDateFrom: jest.fn(() => new Date(Date.now() + 86400000)),
}));

const prisma = require("../src/lib/prisma");
const { sendVerificationEmail } = require("../src/lib/mailer");
const authService = require("../src/modules/auth/auth.service");

describe("email verification", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("verifyEmail", () => {
    test("rejects an unknown token", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.verifyEmail({ token: "bad-token" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("rejects an already-used token", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: "t-1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: "u-1", isActive: true, emailVerifiedAt: null },
      });

      await expect(
        authService.verifyEmail({ token: "used-token" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("rejects an expired token", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: "t-2",
        usedAt: null,
        expiresAt: new Date(Date.now() - 3600000), // expired 1h ago
        user: { id: "u-2", isActive: true, emailVerifiedAt: null },
      });

      await expect(
        authService.verifyEmail({ token: "expired-token" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("rejects a token for an inactive account", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: "t-3",
        usedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: "u-3", isActive: false, emailVerifiedAt: null },
      });

      await expect(
        authService.verifyEmail({ token: "inactive-token" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("succeeds with a valid unused token and calls $transaction", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: "t-4",
        userId: "u-4",
        usedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: "u-4", isActive: true, emailVerifiedAt: null },
      });
      prisma.$transaction.mockResolvedValue([]);

      await authService.verifyEmail({ token: "good-token" });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    test("handles already-verified user idempotently", async () => {
      prisma.emailVerificationToken.findUnique.mockResolvedValue({
        id: "t-5",
        userId: "u-5",
        usedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "u-5",
          isActive: true,
          emailVerifiedAt: new Date("2024-01-01"),
        },
      });

      // Should NOT throw, and should consume the token.
      await authService.verifyEmail({ token: "already-verified" });
      expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: "t-5" },
        data: { usedAt: expect.any(Date) },
      });
      // Should NOT call $transaction (no user update needed).
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("resendVerification", () => {
    test("rejects if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.resendVerification({ userId: "missing" }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("rejects if email already verified", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "u-6",
        email: "verified@test.com",
        fullName: "Test",
        isActive: true,
        emailVerifiedAt: new Date(),
      });

      await expect(
        authService.resendVerification({ userId: "u-6" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("sends verification email for an unverified user", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "u-7",
        email: "unverified@test.com",
        fullName: "Test User",
        isActive: true,
        emailVerifiedAt: null,
      });
      prisma.$transaction.mockResolvedValue([]);

      await authService.resendVerification({ userId: "u-7" });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "unverified@test.com",
          fullName: "Test User",
        }),
      );
    });
  });
});
