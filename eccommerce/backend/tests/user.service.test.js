const { Prisma } = require("@prisma/client");

// ---- Mock Prisma ----

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

// publicMediaUrl is used by the service to resolve avatar paths. Mock it so
// tests are isolated from env.PUBLIC_API_ORIGIN.
jest.mock("../src/utils/publicMediaUrl", () =>
  jest.fn((value) => (value ? `http://localhost:5000${value}` : null)),
);

const userService = require("../src/modules/users/user.service");

// ---- Fixtures ----

const USER_ID = "aabbccdd-1111-2222-3333-444444444444";
const NOW = new Date("2026-09-01T10:00:00.000Z");
const DOB = new Date("1990-07-22T12:00:00.000Z");

function makeUserRow(overrides = {}) {
  return {
    id: USER_ID,
    email: "enrico@example.com",
    fullName: "Enrico Cole",
    phone: "003888232",
    dateOfBirth: DOB,
    gender: "Male",
    address: "Los Angeles, CA",
    aboutYou: "Hello, this is my profile.",
    avatarUrl: "/media/avatars/enrico.webp",
    role: "CUSTOMER",
    emailVerifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// getProfile
// ============================================================

describe("getProfile", () => {
  it("returns the profile for an existing user", async () => {
    const row = makeUserRow();
    mockPrisma.user.findUnique.mockResolvedValue(row);

    const result = await userService.getProfile(USER_ID);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: USER_ID } }),
    );
    expect(result.id).toBe(USER_ID);
    expect(result.email).toBe("enrico@example.com");
    expect(result.fullName).toBe("Enrico Cole");
    expect(result.gender).toBe("Male");
    expect(result.phone).toBe("003888232");
  });

  it("formats dateOfBirth as yyyy-MM-dd", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUserRow());

    const result = await userService.getProfile(USER_ID);

    expect(result.dateOfBirth).toBe("1990-07-22");
  });

  it("returns null dateOfBirth when the column is null", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(
      makeUserRow({ dateOfBirth: null }),
    );

    const result = await userService.getProfile(USER_ID);

    expect(result.dateOfBirth).toBeNull();
  });

  it("resolves avatarUrl via publicMediaUrl", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeUserRow());

    const result = await userService.getProfile(USER_ID);

    expect(result.avatarUrl).toBe(
      "http://localhost:5000/media/avatars/enrico.webp",
    );
  });

  it("returns null avatarUrl when the column is null", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(
      makeUserRow({ avatarUrl: null }),
    );

    const result = await userService.getProfile(USER_ID);

    expect(result.avatarUrl).toBeNull();
  });

  it("throws 404 when the user does not exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(userService.getProfile(USER_ID)).rejects.toMatchObject({
      statusCode: 404,
      message: "Account not found",
    });
  });
});

// ============================================================
// updateProfile
// ============================================================

describe("updateProfile", () => {
  it("updates and returns the profile", async () => {
    const updated = makeUserRow({ fullName: "Enrico Updated" });
    mockPrisma.user.update.mockResolvedValue(updated);

    const result = await userService.updateProfile(USER_ID, {
      fullName: "Enrico Updated",
    });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: USER_ID },
        data: { fullName: "Enrico Updated" },
      }),
    );
    expect(result.fullName).toBe("Enrico Updated");
  });

  it("strips undefined values so omitted fields are not overwritten", async () => {
    const updated = makeUserRow();
    mockPrisma.user.update.mockResolvedValue(updated);

    await userService.updateProfile(USER_ID, {
      fullName: "Enrico Cole",
      phone: undefined,
      gender: undefined,
    });

    // Only fullName should be in the data — the rest were undefined.
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { fullName: "Enrico Cole" },
      }),
    );
  });

  it("rejects an empty body", async () => {
    await expect(userService.updateProfile(USER_ID, {})).rejects.toMatchObject({
      statusCode: 400,
      message: "Provide at least one field to update",
    });

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects a body with only undefined values", async () => {
    await expect(
      userService.updateProfile(USER_ID, {
        fullName: undefined,
        phone: undefined,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("throws conflict on duplicate phone (P2002)", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0", meta: { target: ["phone"] } },
    );
    mockPrisma.user.update.mockRejectedValue(error);

    await expect(
      userService.updateProfile(USER_ID, { phone: "1234567890" }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "That phone number is already in use",
    });
  });

  it("throws 404 when the user was deleted mid-session (P2025)", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Record to update not found",
      { code: "P2025", clientVersion: "5.0.0" },
    );
    mockPrisma.user.update.mockRejectedValue(error);

    await expect(
      userService.updateProfile(USER_ID, { fullName: "Ghost" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Account not found",
    });
  });

  it("re-throws unexpected errors", async () => {
    const error = new Error("Connection lost");
    mockPrisma.user.update.mockRejectedValue(error);

    await expect(
      userService.updateProfile(USER_ID, { fullName: "Boom" }),
    ).rejects.toBe(error);
  });
});

// ============================================================
// updateAvatar
// ============================================================

describe("updateAvatar", () => {
  it("saves the avatar path and returns the profile", async () => {
    const updated = makeUserRow({
      avatarUrl: "/media/avatars/new-avatar.webp",
    });
    mockPrisma.user.update.mockResolvedValue(updated);

    const result = await userService.updateAvatar(
      USER_ID,
      "/media/avatars/new-avatar.webp",
    );

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: USER_ID },
        data: { avatarUrl: "/media/avatars/new-avatar.webp" },
      }),
    );
    expect(result.avatarUrl).toBe(
      "http://localhost:5000/media/avatars/new-avatar.webp",
    );
  });

  it("throws 404 when the user does not exist (P2025)", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Record to update not found",
      { code: "P2025", clientVersion: "5.0.0" },
    );
    mockPrisma.user.update.mockRejectedValue(error);

    await expect(
      userService.updateAvatar(USER_ID, "/media/avatars/ghost.webp"),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Account not found",
    });
  });
});
