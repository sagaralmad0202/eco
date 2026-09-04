const request = require("supertest");
const app = require("../src/app");
const contactService = require("../src/modules/contact/contact.service");
const { signAccessToken } = require("../src/utils/jwt");
const prisma = require("../src/lib/prisma");

jest.mock("../src/modules/contact/contact.service");

describe("Contact routes — POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    message: "Need assistance with order shipping.",
  };

  it("handles guest submission with 201 Created and null userId", async () => {
    contactService.createContactMessage.mockResolvedValue({
      id: "cccccccc-1111-2222-3333-444444444444",
      createdAt: new Date(),
    });

    const response = await request(app)
      .post("/api/contact")
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Your message has been sent successfully.",
    });

    // Verify service received null userId
    expect(contactService.createContactMessage).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      email: "jane@example.com",
      message: "Need assistance with order shipping.",
      userId: null,
    });
  });

  it("ignores spoofed userId in body during guest submission", async () => {
    contactService.createContactMessage.mockResolvedValue({
      id: "cccccccc-1111-2222-3333-444444444444",
      createdAt: new Date(),
    });

    const response = await request(app)
      .post("/api/contact")
      .send({
        ...validPayload,
        userId: "99999999-9999-9999-9999-999999999999",
      });

    expect(response.status).toBe(201);
    // Even if userId is sent in the body, it must NEVER reach the service as a spoofed ID
    expect(contactService.createContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
      }),
    );
  });

  it("associates authenticated user ID when valid Bearer token is provided", async () => {
    const testUser = {
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      email: "authuser@example.com",
      fullName: "Auth User",
      role: "CUSTOMER",
      isActive: true,
      emailVerifiedAt: new Date(),
    };

    // Mock prisma.user.findUnique for optionalAuth
    const prismaSpy = jest.spyOn(prisma.user, "findUnique").mockResolvedValue(testUser);

    const token = signAccessToken(testUser);

    contactService.createContactMessage.mockResolvedValue({
      id: "cccccccc-1111-2222-3333-444444444444",
      createdAt: new Date(),
    });

    const response = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(contactService.createContactMessage).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      email: "jane@example.com",
      message: "Need assistance with order shipping.",
      userId: testUser.id,
    });

    prismaSpy.mockRestore();
  });

  it("rejects request with missing required fields (e.g. message)", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send({
        fullName: "Jane Doe",
        email: "jane@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(contactService.createContactMessage).not.toHaveBeenCalled();
  });

  it("rejects request with invalid email format", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send({
        fullName: "Jane Doe",
        email: "invalid-email",
        message: "Hello world",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(contactService.createContactMessage).not.toHaveBeenCalled();
  });

  it("does not expose public GET /api/contact", async () => {
    const response = await request(app).get("/api/contact");
    expect(response.status).toBe(404);
  });
});
