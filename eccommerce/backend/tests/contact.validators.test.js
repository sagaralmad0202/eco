const { createContactMessageSchema } = require("../src/modules/contact/contact.validators");

describe("Contact validators", () => {
  describe("createContactMessageSchema", () => {
    const validPayload = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      message: "I would like to know more about your products.",
    };

    it("accepts a valid payload", () => {
      const result = createContactMessageSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        fullName: "Jane Doe",
        email: "jane@example.com",
        message: "I would like to know more about your products.",
      });
    });

    it("trims whitespace from all fields", () => {
      const result = createContactMessageSchema.safeParse({
        fullName: "  Jane Doe  ",
        email: "  JANE@EXAMPLE.COM  ",
        message: "  Hello  ",
      });
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe("Jane Doe");
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.message).toBe("Hello");
    });

    it("normalizes email to lowercase", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        email: "JANE@EXAMPLE.COM",
      });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("jane@example.com");
    });

    it("rejects missing fullName", () => {
      const result = createContactMessageSchema.safeParse({
        email: "jane@example.com",
        message: "Hello",
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes("fullName"))).toBe(true);
    });

    it("rejects empty fullName", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        fullName: "   ",
      });
      expect(result.success).toBe(false);
    });

    it("rejects fullName exceeding 200 characters", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        fullName: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing email", () => {
      const result = createContactMessageSchema.safeParse({
        fullName: "Jane",
        message: "Hello",
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    });

    it("rejects empty email", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        email: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email exceeding 254 characters", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        email: "a".repeat(243) + "@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing message", () => {
      const result = createContactMessageSchema.safeParse({
        fullName: "Jane",
        email: "jane@example.com",
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path.includes("message"))).toBe(true);
    });

    it("rejects empty message", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        message: "  ",
      });
      expect(result.success).toBe(false);
    });

    it("rejects message exceeding 5000 characters", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        message: "A".repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it("strips unknown fields", () => {
      const result = createContactMessageSchema.safeParse({
        ...validPayload,
        status: "RESOLVED",
        id: "injected-id",
        role: "ADMIN",
      });
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty("status");
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("role");
    });
  });
});
