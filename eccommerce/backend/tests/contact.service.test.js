// ---- Mock Prisma ----

const mockPrisma = {
  contactMessage: {
    create: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

const contactService = require("../src/modules/contact/contact.service");

// ---- Fixtures ----

const MESSAGE_ID = "cccccccc-1111-2222-3333-444444444444";
const USER_ID = "11111111-2222-3333-4444-555555555555";
const NOW = new Date("2026-09-04T10:00:00.000Z");

const VALID_INPUT = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  message: "I would like to know more about your products.",
};

describe("Contact service", () => {
  afterEach(() => jest.clearAllMocks());

  describe("createContactMessage", () => {
    it("persists a guest contact message with userId: null and status: NEW", async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: MESSAGE_ID,
        createdAt: NOW,
      });

      const result = await contactService.createContactMessage(VALID_INPUT);

      expect(result).toEqual({ id: MESSAGE_ID, createdAt: NOW });
      expect(mockPrisma.contactMessage.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          fullName: VALID_INPUT.fullName,
          email: VALID_INPUT.email,
          message: VALID_INPUT.message,
          userId: null,
          status: "NEW",
        },
        select: { id: true, createdAt: true },
      });
    });

    it("persists an authenticated contact message with the provided userId", async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: MESSAGE_ID,
        createdAt: NOW,
      });

      const result = await contactService.createContactMessage({
        ...VALID_INPUT,
        userId: USER_ID,
      });

      expect(result).toEqual({ id: MESSAGE_ID, createdAt: NOW });
      expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          fullName: VALID_INPUT.fullName,
          email: VALID_INPUT.email,
          message: VALID_INPUT.message,
          userId: USER_ID,
          status: "NEW",
        },
        select: { id: true, createdAt: true },
      });
    });

    it("enforces status NEW even if client tries to override it", async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: MESSAGE_ID,
        createdAt: NOW,
      });

      await contactService.createContactMessage({
        ...VALID_INPUT,
        status: "RESOLVED",
        id: "injected",
      });

      const callArgs = mockPrisma.contactMessage.create.mock.calls[0][0];
      expect(callArgs.data.status).toBe("NEW");
      expect(callArgs.data).not.toHaveProperty("id");
    });

    it("propagates database errors safely", async () => {
      mockPrisma.contactMessage.create.mockRejectedValue(
        new Error("Database connection lost"),
      );

      await expect(
        contactService.createContactMessage(VALID_INPUT),
      ).rejects.toThrow("Database connection lost");
    });
  });
});
