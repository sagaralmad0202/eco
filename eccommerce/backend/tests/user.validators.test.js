const { updateProfileSchema } = require("../src/modules/users/user.validators");

// Helper: parse and return { success, data, error }
function parse(input) {
  return updateProfileSchema.safeParse(input);
}

// ============================================================
// Valid inputs
// ============================================================

describe("updateProfileSchema — valid inputs", () => {
  it("accepts a single field", () => {
    const result = parse({ fullName: "Jane Doe" });
    expect(result.success).toBe(true);
    expect(result.data.fullName).toBe("Jane Doe");
  });

  it("accepts all fields at once", () => {
    const result = parse({
      fullName: "Jane Doe",
      phone: "003 888 232",
      dateOfBirth: "1990-07-22",
      gender: "Female",
      address: "New York, NY",
      aboutYou: "Hello!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null to clear optional fields", () => {
    const result = parse({
      phone: null,
      dateOfBirth: null,
      gender: null,
      address: null,
      aboutYou: null,
    });
    expect(result.success).toBe(true);
    expect(result.data.phone).toBeNull();
    expect(result.data.dateOfBirth).toBeNull();
    expect(result.data.gender).toBeNull();
    expect(result.data.address).toBeNull();
    expect(result.data.aboutYou).toBeNull();
  });

  it("transforms empty phone string to null", () => {
    const result = parse({ phone: "" });
    expect(result.success).toBe(true);
    expect(result.data.phone).toBeNull();
  });

  it("strips phone formatting", () => {
    const result = parse({ phone: "+91 98765-43210" });
    expect(result.success).toBe(true);
    expect(result.data.phone).toBe("919876543210");
  });

  it("transforms empty dateOfBirth string to null", () => {
    const result = parse({ dateOfBirth: "" });
    expect(result.success).toBe(true);
    expect(result.data.dateOfBirth).toBeNull();
  });

  it("parses a valid date to a Date object", () => {
    const result = parse({ dateOfBirth: "1990-07-22" });
    expect(result.success).toBe(true);
    expect(result.data.dateOfBirth).toBeInstanceOf(Date);
    expect(result.data.dateOfBirth.toISOString()).toBe(
      "1990-07-22T12:00:00.000Z",
    );
  });

  it("accepts each valid gender value", () => {
    for (const g of ["Male", "Female", "Other"]) {
      const result = parse({ gender: g });
      expect(result.success).toBe(true);
      expect(result.data.gender).toBe(g);
    }
  });
});

// ============================================================
// Invalid inputs
// ============================================================

describe("updateProfileSchema — invalid inputs", () => {
  it("rejects an empty body", () => {
    const result = parse({});
    expect(result.success).toBe(false);
  });

  it("rejects fullName shorter than 2 characters", () => {
    const result = parse({ fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects fullName longer than 100 characters", () => {
    const result = parse({ fullName: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone (too short)", () => {
    const result = parse({ phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone with letters", () => {
    const result = parse({ phone: "abcdefghij" });
    expect(result.success).toBe(false);
  });

  it("rejects a date of birth in the future", () => {
    const result = parse({ dateOfBirth: "2099-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date (Feb 31)", () => {
    const result = parse({ dateOfBirth: "2026-02-31" });
    expect(result.success).toBe(false);
  });

  it("rejects a date with wrong format", () => {
    const result = parse({ dateOfBirth: "22/07/1990" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gender value", () => {
    const result = parse({ gender: "NonBinary" });
    expect(result.success).toBe(false);
  });

  it("rejects address longer than 200 characters", () => {
    const result = parse({ address: "A".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects aboutYou longer than 1000 characters", () => {
    const result = parse({ aboutYou: "A".repeat(1001) });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// Security: unknown keys are stripped
// ============================================================

describe("updateProfileSchema — security", () => {
  it("strips unknown keys like email and role", () => {
    const result = parse({
      fullName: "Jane Doe",
      email: "hacker@evil.com",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("email");
    expect(result.data).not.toHaveProperty("role");
  });
});
