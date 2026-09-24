// Tests for the background job queue and email worker.
//
// These tests mock pg-boss so they run without a database connection.
// They verify the wiring between auth.service → enqueue → emailWorker → mailer.

const { handleEmailJob } = require("../src/workers/emailWorker");

// ─── Mock mailer ───────────────────────────────────────────────────────
const mockSendPasswordReset = jest.fn().mockResolvedValue({ delivered: true });
const mockSendVerification = jest.fn().mockResolvedValue({ delivered: true });

jest.mock("../src/lib/mailer", () => ({
  sendPasswordResetEmail: (...args) => mockSendPasswordReset(...args),
  sendVerificationEmail: (...args) => mockSendVerification(...args),
}));

// ─── Mock jobQueue for auth.service tests ──────────────────────────────
const mockEnqueue = jest.fn().mockResolvedValue("job-123");

jest.mock("../src/lib/jobQueue", () => ({
  enqueue: (...args) => mockEnqueue(...args),
  startQueue: jest.fn().mockResolvedValue({}),
  stopQueue: jest.fn().mockResolvedValue(),
  registerWorker: jest.fn().mockResolvedValue(),
}));

// ─── Mock prisma ───────────────────────────────────────────────────────
jest.mock("../src/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  cart: { findUnique: jest.fn(), create: jest.fn() },
  $transaction: jest.fn().mockResolvedValue([]),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}));

// ─── Mock env ──────────────────────────────────────────────────────────
jest.mock("../src/config/env", () => ({
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-access-secret-that-is-long-enough-for-hmac",
  JWT_REFRESH_SECRET: "test-refresh-secret-that-is-long-enough-for-hmac",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  PASSWORD_RESET_EXPIRES_IN: "30m",
  EMAIL_VERIFICATION_EXPIRES_IN: "24h",
  CLIENT_ORIGIN: "http://localhost:3000",
  PUBLIC_API_ORIGIN: "http://localhost:5000",
  MAIL_ENABLED: true,
  COOKIE_SECURE: false,
  DATABASE_URL: "postgresql://test:test@localhost/test",
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ───────────────────────────────────────────────────────────────────────
// EMAIL WORKER TESTS
// ───────────────────────────────────────────────────────────────────────

describe("Email Worker — handleEmailJob", () => {
  test("processes password-reset job and calls sendPasswordResetEmail", async () => {
    const job = {
      id: "job-001",
      data: {
        type: "password-reset",
        to: "user@example.com",
        fullName: "Test User",
        resetUrl: "http://localhost:3000/reset-password?token=abc123",
        expiresInLabel: "30 minutes",
      },
    };

    await handleEmailJob(job);

    expect(mockSendPasswordReset).toHaveBeenCalledTimes(1);
    expect(mockSendPasswordReset).toHaveBeenCalledWith({
      to: "user@example.com",
      fullName: "Test User",
      resetUrl: "http://localhost:3000/reset-password?token=abc123",
      expiresInLabel: "30 minutes",
    });
  });

  test("processes verification job and calls sendVerificationEmail", async () => {
    const job = {
      id: "job-002",
      data: {
        type: "verification",
        to: "new@example.com",
        fullName: "New User",
        verifyUrl: "http://localhost:3000/verify-email?token=xyz456",
        expiresInLabel: "24 hours",
      },
    };

    await handleEmailJob(job);

    expect(mockSendVerification).toHaveBeenCalledTimes(1);
    expect(mockSendVerification).toHaveBeenCalledWith({
      to: "new@example.com",
      fullName: "New User",
      verifyUrl: "http://localhost:3000/verify-email?token=xyz456",
      expiresInLabel: "24 hours",
    });
  });

  test("skips unknown email type without throwing", async () => {
    const job = {
      id: "job-003",
      data: {
        type: "unknown-type",
        to: "user@example.com",
      },
    };

    // Should not throw — unknown types are logged and skipped.
    await expect(handleEmailJob(job)).resolves.not.toThrow();
    expect(mockSendPasswordReset).not.toHaveBeenCalled();
    expect(mockSendVerification).not.toHaveBeenCalled();
  });

  test("propagates SMTP error so pg-boss can retry", async () => {
    mockSendPasswordReset.mockRejectedValueOnce(new Error("SMTP timeout"));

    const job = {
      id: "job-004",
      data: {
        type: "password-reset",
        to: "user@example.com",
        fullName: "Test User",
        resetUrl: "http://localhost:3000/reset-password?token=abc",
        expiresInLabel: "30 minutes",
      },
    };

    await expect(handleEmailJob(job)).rejects.toThrow("SMTP timeout");
  });
});

// ───────────────────────────────────────────────────────────────────────
// AUTH.SERVICE ENQUEUE INTEGRATION TESTS
// ───────────────────────────────────────────────────────────────────────

describe("auth.service — email enqueue integration", () => {
  const prisma = require("../src/lib/prisma");
  const authService = require("../src/modules/auth/auth.service");

  test("forgotPassword enqueues a password-reset email job", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      fullName: "Test User",
      isActive: true,
    });

    await authService.forgotPassword({ email: "test@example.com" });

    expect(mockEnqueue).toHaveBeenCalledTimes(1);
    expect(mockEnqueue).toHaveBeenCalledWith(
      "send-email",
      expect.objectContaining({
        type: "password-reset",
        to: "test@example.com",
        fullName: "Test User",
      }),
    );

    // The enqueued data should contain a resetUrl.
    const enqueuedData = mockEnqueue.mock.calls[0][1];
    expect(enqueuedData.resetUrl).toMatch(/reset-password\?token=/);
    expect(enqueuedData.expiresInLabel).toBe("30 minutes");
  });

  test("forgotPassword does not throw if enqueue fails", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      email: "fail@example.com",
      fullName: "Fail User",
      isActive: true,
    });
    mockEnqueue.mockRejectedValueOnce(new Error("Queue down"));

    // Should not throw — the endpoint must remain silent about failures
    // to prevent account-existence leaks.
    await expect(
      authService.forgotPassword({ email: "fail@example.com" }),
    ).resolves.not.toThrow();
  });
});

// ───────────────────────────────────────────────────────────────────────
// JOBQUEUE MODULE TESTS
// ───────────────────────────────────────────────────────────────────────

describe("jobQueue module", () => {
  test("enqueue returns null when queue is not started", async () => {
    // Reset the module to get a fresh un-started instance.
    jest.resetModules();

    // Re-mock dependencies for the fresh require.
    jest.mock("../src/config/env", () => ({
      DATABASE_URL: "postgresql://test:test@localhost/test",
    }));
    jest.mock("../src/lib/logger", () => ({
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    }));

    // Mock pg-boss constructor so it doesn't actually connect.
    jest.mock("pg-boss", () => {
      return jest.fn().mockImplementation(() => ({
        start: jest.fn().mockResolvedValue(),
        stop: jest.fn().mockResolvedValue(),
        send: jest.fn().mockResolvedValue("mock-job-id"),
        work: jest.fn().mockResolvedValue(),
        on: jest.fn(),
      }));
    });

    const { enqueue } = jest.requireActual("../src/lib/jobQueue");

    const result = await enqueue("send-email", { test: true });
    expect(result).toBeNull();
  });
});
