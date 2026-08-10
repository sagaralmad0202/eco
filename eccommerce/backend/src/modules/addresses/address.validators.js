const { z } = require("zod");

// Indian postal codes: six digits, never starting with 0.
const postalCode = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const createAddressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(100),
  phone,
  line1: z.string().trim().min(5, "Enter the street address").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode,
  // ISO-3166 alpha-2. Stored uppercase so "in" and "IN" cannot both exist.
  country: z.string().trim().length(2).toUpperCase().default("IN"),
  isDefault: z.boolean().default(false),
});

// Every field optional, but at least one required — an empty PATCH body is a
// client bug, and silently returning 200 for it hides that bug.
const updateAddressSchema = createAddressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const idParamSchema = z.object({
  id: z.string().uuid("Not a valid address id"),
});

module.exports = { createAddressSchema, updateAddressSchema, idParamSchema };
