const { z } = require("zod");

const createContactMessageSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(1, "Full name cannot be empty")
    .max(200, "Full name must be 200 characters or fewer"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email cannot be empty")
    .max(254, "Email must be 254 characters or fewer")
    .email("Please enter a valid email address")
    .toLowerCase(),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be 5000 characters or fewer"),
});

module.exports = { createContactMessageSchema };
