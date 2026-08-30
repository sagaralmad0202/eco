// Social login (OAuth) unit tests.
//
// The provider round-trip itself (Google/Facebook/Twitter answering) cannot
// be exercised without real credentials, so the provider module is mocked and
// these tests cover everything on OUR side: state validation, user
// resolution/linking rules, and the one-time exchange code lifecycle.

process.env.GOOGLE_CLIENT_ID = "test-google-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
process.env.FACEBOOK_CLIENT_ID = "test-fb-id";
process.env.FACEBOOK_CLIENT_SECRET = "test-fb-secret";
process.env.TWITTER_CLIENT_ID = "test-tw-id";
process.env.TWITTER_CLIENT_SECRET = "test-tw-secret";

jest.mock("../src/lib/prisma", () => ({
  oauthState: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  oAuthAccount: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  oAuthExchangeCode: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
}));

// The service is required through the same path the controller uses so the
// mock applies once for both.
jest.mock("../src/modules/auth/oauth.providers", () => {
  const buildAuthorizationUrl = jest.fn((provider) => ({
    url: `https://provider.example/auth?provider=${provider}`,
    state: "raw-state",
    codeVerifier: "verifier",
  }));
  const exchangeCode = jest.fn();
  const fetchProfile = jest.fn();
  return { buildAuthorizationUrl, exchangeCode, fetchProfile };
});

const prisma = require("../src/lib/prisma");
const providers = require("../src/modules/auth/oauth.providers");
const oauthService = require("../src/modules/auth/oauth.service");
const { hashToken } = require("../src/utils/jwt");

const ACTIVE_USER = {
  id: "user-1",
  email: "jane@example.com",
  fullName: "Jane Doe",
  role: "CUSTOMER",
  isActive: true,
};

function profile(overrides = {}) {
  return {
    providerUserId: "provider-user-1",
    email: "jane@example.com",
    emailVerified: true,
    fullName: "Jane Doe",
    avatarUrl: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ----------------------- state -----------------------

describe("OAuth state", () => {
  test("createState persists only the hash and returns the provider URL", async () => {
    const url = await oauthService.createState("google");

    expect(url).toContain("https://provider.example/auth");
    expect(prisma.oauthState.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stateHash: hashToken("raw-state"),
          provider: "google",
          codeVerifier: "verifier",
        }),
      }),
    );
  });

  test("consumeState rejects a missing state", async () => {
    await expect(oauthService.consumeState("google")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test("consumeState rejects an unknown state", async () => {
    prisma.oauthState.findUnique.mockResolvedValue(null);

    await expect(oauthService.consumeState("google", "bogus")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test("consumeState rejects a state minted for a different provider", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "facebook",
      codeVerifier: null,
      expiresAt: new Date(Date.now() + 60000),
    });

    await expect(oauthService.consumeState("google", "raw-state")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test("consumeState rejects an expired state and deletes it", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() - 1000),
    });
    prisma.oauthState.delete.mockResolvedValue({});

    await expect(oauthService.consumeState("google", "raw-state")).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(prisma.oauthState.delete).toHaveBeenCalledWith({
      where: { id: "state-1" },
    });
  });

  test("consumeState consumes a valid state exactly once and returns the verifier", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});

    const result = await oauthService.consumeState("google", "raw-state");

    expect(result).toEqual({ codeVerifier: "verifier" });
    expect(prisma.oauthState.delete).toHaveBeenCalledWith({
      where: { id: "state-1" },
    });
  });
});

// ----------------------- callback / user resolution -----------------------

describe("handleCallback user resolution", () => {
  async function runCallback(profileOverrides, provider = "google") {
    providers.exchangeCode.mockResolvedValue({ access_token: "t" });
    providers.fetchProfile.mockResolvedValue(profile(profileOverrides));
    return oauthService.handleCallback(provider, {
      code: "auth-code",
      state: "raw-state",
    });
  }

  test("rejects a callback with no code (user denied / error)", async () => {
    await expect(
      oauthService.handleCallback("google", { state: "raw-state" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("Scenario C: existing linked identity signs that user in", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue({
      userId: ACTIVE_USER.id,
      user: ACTIVE_USER,
    });

    const user = await runCallback();

    expect(user).toEqual(ACTIVE_USER);
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  test("refuses login when the linked user is deactivated", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue({
      userId: "u",
      user: { ...ACTIVE_USER, isActive: false },
    });

    await expect(runCallback()).rejects.toMatchObject({ statusCode: 403 });
  });

  test("Scenario B: verified email on an existing account LINKS, never duplicates", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    // No prisma.user mock here on purpose: the service's linked-user path is
    // exercised below; for this test linkProviderAccount is reached via the
    // user lookup which lives on prisma.user — mock it:
    prisma.user = { findUnique: jest.fn() };
    prisma.user.findUnique.mockResolvedValue({ ...ACTIVE_USER, oauthAccounts: [] });
    prisma.oAuthAccount.create.mockResolvedValue({ user: ACTIVE_USER });

    const user = await runCallback();

    expect(user).toEqual(ACTIVE_USER);
    expect(prisma.oAuthAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: ACTIVE_USER.id,
          provider: "google",
          providerUserId: "provider-user-1",
        }),
      }),
    );
    delete prisma.user;
  });

  test("Scenario D: unverified provider email is refused (no takeover)", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "facebook",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);

    await expect(
      runCallback({ emailVerified: false }, "facebook"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("Scenario E: provider returns no email — refused, not merged", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "twitter",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);

    await expect(
      runCallback({ email: null, emailVerified: false }, "twitter"),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  test("Scenario A: brand-new user is created verified, with an unmatchable password hash", async () => {
    prisma.oauthState.findUnique.mockResolvedValue({
      id: "state-1",
      provider: "google",
      codeVerifier: "verifier",
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.oauthState.delete.mockResolvedValue({});
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };
    prisma.oAuthAccount.create.mockImplementation(({ data }) => ({
      user: { ...ACTIVE_USER, ...data.user?.create },
    }));

    await runCallback();

    const createData = prisma.oAuthAccount.create.mock.calls[0][0].data;
    expect(createData.user.create.email).toBe("jane@example.com");
    expect(createData.user.create.emailVerifiedAt).toBeInstanceOf(Date);
    // A password hash IS stored (NOT NULL column) but is random — password
    // login can never succeed for it.
    expect(createData.user.create.passwordHash).toMatch(/^\$2[aby]\$/);
    delete prisma.user;
  });
});

// ----------------------- exchange codes -----------------------

describe("one-time exchange codes", () => {
  function storedRow(overrides = {}) {
    return {
      id: "code-1",
      userId: ACTIVE_USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
      user: ACTIVE_USER,
      ...overrides,
    };
  }

  test("issueExchangeCode stores only the hash", async () => {
    prisma.oAuthExchangeCode.create.mockResolvedValue({});

    const raw = await oauthService.issueExchangeCode(ACTIVE_USER.id);

    expect(typeof raw).toBe("string");
    expect(raw.length).toBeGreaterThanOrEqual(32);
    expect(prisma.oAuthExchangeCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codeHash: hashToken(raw) }),
      }),
    );
  });

  test("a valid code returns the user and calls issueTokens", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(storedRow());
    prisma.oAuthExchangeCode.updateMany.mockResolvedValue({ count: 1 });
    const issueTokens = jest.fn().mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
    });

    const result = await oauthService.consumeExchangeCode("raw-code", {
      issueTokens,
    });

    expect(result.user).toEqual(ACTIVE_USER);
    expect(issueTokens).toHaveBeenCalledWith(ACTIVE_USER);
  });

  test("a reused code is rejected (single use)", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(
      storedRow({ usedAt: new Date() }),
    );

    await expect(
      oauthService.consumeExchangeCode("raw-code", { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("an expired code is rejected", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(
      storedRow({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(
      oauthService.consumeExchangeCode("raw-code", { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("an unknown code is rejected", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(null);

    await expect(
      oauthService.consumeExchangeCode("nope", { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("a code whose user was deactivated is rejected", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(
      storedRow({ user: { ...ACTIVE_USER, isActive: false } }),
    );

    await expect(
      oauthService.consumeExchangeCode("raw-code", { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("a race on claiming the code (updateMany matched 0) is rejected", async () => {
    prisma.oAuthExchangeCode.findUnique.mockResolvedValue(storedRow());
    prisma.oAuthExchangeCode.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      oauthService.consumeExchangeCode("raw-code", { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("a missing code is rejected as bad request", async () => {
    await expect(
      oauthService.consumeExchangeCode(undefined, { issueTokens: jest.fn() }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
