const { z } = require("zod");

// Email is lowercased so "Admin@Shop.com" and "admin@shop.com" cannot
// become two separate accounts.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

// 8 characters minimum with a letter and a digit. Deliberately not a wall of
// symbol rules — length matters far more than forced punctuation, and harsh
// rules push people toward "Password1!" and sticky notes.
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

const registerSchema = z.object({
  email,
  password,
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  // Indian mobile format; loosen this when you ship internationally.
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional(),
});

const loginSchema = z.object({
  email,
  // No strength rules on login — an old weak password must still work.
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

// Only an email. Do not accept a userId here — that would let anyone trigger
// reset mail for an account by guessing IDs.
const forgotPasswordSchema = z.object({
  email,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  // Reuse the strength rules: a reset must not be a way to set a weaker
  // password than signup allows.
  password,
});

// currentPassword is required even though the caller is already
// authenticated. If someone walks up to an unlocked laptop, or an access
// token leaks, this is what stops them taking over the account outright.
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Your current password is required"),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
