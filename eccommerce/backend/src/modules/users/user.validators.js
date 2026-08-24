const { z } = require("zod");

// Profile fields for the /account page.
//
// Every field is optional and nullable, which is the whole shape of this
// endpoint: signup asks for email, password and name only, so a real profile is
// mostly empty and the form must be able to clear a field it previously set.
//
// null and undefined mean different things here and are not interchangeable:
//   - undefined -> key absent from the PATCH, leave the column untouched
//   - null      -> the customer emptied the input, write NULL
// Collapsing the two would make clearing a date of birth impossible.
const nullableTrimmedString = (max, message) =>
  z
    .string()
    .trim()
    .max(max, message)
    // "" is what an emptied text input actually submits. Storing a blank string
    // alongside NULL would give two representations of "not set", and then
    // every read site needs to check for both.
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

// Matches the Address model's rule so a customer cannot save a number here that
// checkout would later reject. Digits only, after stripping the spaces and
// punctuation people naturally type ("003 888 232", "+91 98765-43210").
const phone = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional()
  .transform((value) =>
    typeof value === "string" ? value.replace(/[\s()+-]/g, "") : value,
  )
  .refine(
    (value) =>
      value === null || value === undefined || /^\d{6,15}$/.test(value),
    {
      message: "Enter a valid phone number",
    },
  );

// The <input type="date"> in the form submits yyyy-MM-dd, and the column is
// DATE. Parsed at noon UTC rather than midnight so a server or client in a
// negative-offset timezone cannot roll the stored date back by a day — a
// birthday that drifts to the 21st every time it is saved is a real bug.
const dateOfBirth = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional()
  .superRefine((value, ctx) => {
    if (value === null || value === undefined) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use the date format yyyy-MM-dd",
      });
      return;
    }

    const parsed = new Date(`${value}T12:00:00.000Z`);

    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "That is not a real date",
      });
      return;
    }

    // Round-trip check. "2026-02-31" parses to March 3rd rather than failing,
    // so the only reliable test is whether it survives the trip unchanged.
    if (parsed.toISOString().slice(0, 10) !== value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "That is not a real date",
      });
      return;
    }

    if (parsed.getTime() > Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of birth cannot be in the future",
      });
    }
  })
  .transform((value) =>
    typeof value === "string" ? new Date(`${value}T12:00:00.000Z`) : value,
  );

// Note what is absent: email and role.
//
// Email is the login identifier and is unique, so moving it is an account
// takeover risk if the new address is never proved — that belongs behind the
// EmailVerificationToken flow, not a profile PATCH. role is absent because a
// customer must never be able to promote themselves to ADMIN. zod strips
// unknown keys, so sending either is silently ignored rather than honoured.
const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "That name is too long")
      .optional(),
    phone,
    dateOfBirth,
    // Constrained to the three options the form offers. Free text here would
    // mean the dropdown silently fails to display whatever else got stored.
    gender: z
      .enum(["Male", "Female", "Other"], {
        errorMap: () => ({ message: "Choose Male, Female or Other" }),
      })
      .nullable()
      .optional(),
    address: nullableTrimmedString(200, "That address is too long"),
    aboutYou: nullableTrimmedString(1000, "Keep this under 1000 characters"),
  })
  // An empty PATCH body is a client bug. Answering 200 to it hides the bug and
  // costs a database round trip to change nothing.
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = { updateProfileSchema };
