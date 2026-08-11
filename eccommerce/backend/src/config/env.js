// Loads .env and validates it BEFORE the app starts.
//
// Why: a missing JWT secret should crash the process on startup with a clear
// message, not silently sign tokens with "undefined" and fail at 2am.

require("dotenv").config();

const { z } = require("zod");

// An unset variable in .env is often an empty string rather than undefined
// (e.g. SMTP_HOST=""). Without this, .default() never fires and z.coerce
// turns "" into 0. Treat blank as "not provided".
const blankToUndefined = (schema) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

// "15m", "7d", "30s" — must match the parser in utils/jwt.js exactly,
// otherwise a typo here fails at token-signing time instead of at boot.
const duration = z
  .string()
  .regex(/^\d+[smhd]$/, "Use a duration like 30m, 24h or 7d");

// Rates stay STRINGS all the way to Decimal rather than going through
// z.coerce.number(). Same reason as rule 1 in utils/money.js: the moment a rate
// becomes a float it can no longer be multiplied by a subtotal exactly, and a
// tax line that is off by a paise is a tax line someone reconciles by hand.
const rate = (label) =>
  z.string().regex(/^\d+(\.\d{1,2})?$/, `Use a plain ${label} like 5 or 49.50`);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is missing from .env"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is missing from .env"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: blankToUndefined(duration.default("15m")),
  JWT_REFRESH_EXPIRES_IN: blankToUndefined(duration.default("7d")),

  EMAIL_VERIFICATION_EXPIRES_IN: blankToUndefined(duration.default("24h")),

  CLIENT_ORIGIN: blankToUndefined(
    z.string().min(1).default("http://localhost:3000")
  ),

  // "warn" in production keeps the noise down; "debug" while developing.
  LOG_LEVEL: blankToUndefined(
    z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info")
  ),

  // Set true only when the API is served over HTTPS. A Secure cookie is
  // silently dropped by the browser over plain http, which would break login
  // on localhost with no visible error.
  COOKIE_SECURE: blankToUndefined(
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default("false")
  ),

  // Razorpay. Optional in development so the API boots without an account,
  // but checked below and required in production — see the guard further down.
  RAZORPAY_KEY_ID: blankToUndefined(z.string().optional()),
  RAZORPAY_KEY_SECRET: blankToUndefined(z.string().optional()),
  // Set in the Razorpay dashboard when creating the webhook. This is a
  // DIFFERENT value from KEY_SECRET and signs the webhook body.
  RAZORPAY_WEBHOOK_SECRET: blankToUndefined(z.string().optional()),

  // Email is optional on purpose. With no SMTP_HOST the app still runs and
  // password reset links are logged to the console — a fresher cloning this
  // repo should not need a mail server before they can log in.
  SMTP_HOST: blankToUndefined(z.string().optional()),
  SMTP_PORT: blankToUndefined(z.coerce.number().int().positive().default(587)),
  SMTP_USER: blankToUndefined(z.string().optional()),
  SMTP_PASS: blankToUndefined(z.string().optional()),
  MAIL_FROM: blankToUndefined(
    z.string().default("Ciseco Support <no-reply@ciseco.local>")
  ),

  PASSWORD_RESET_EXPIRES_IN: blankToUndefined(duration.default("30m")),

  // ---------------------- CART TOTALS ----------------------
  //
  // Flat rates, deliberately. Real carrier pricing and real tax jurisdictions
  // both need a destination, and the cart has no address until checkout
  // collects one — so anything cleverer here would be guessing. These live in
  // env rather than in code so changing the shipping fee is not a deploy of
  // cart.service.js.
  //
  // The cart's job is to show the customer a total that matches what they will
  // be charged. When an orders module lands it must reuse the same numbers,
  // otherwise the cart and the invoice disagree.
  SHIPPING_FLAT_FEE: blankToUndefined(rate("amount").default("5.00")),

  // Optional. Unset means shipping is always charged; set it to the subtotal
  // at which delivery becomes free.
  FREE_SHIPPING_ABOVE: blankToUndefined(rate("amount").optional()),

  // Percentage applied to the subtotal. 18 is GST, matching the INR default on
  // the Order model.
  TAX_PERCENT: blankToUndefined(rate("percentage").default("18")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\nInvalid environment configuration:\n");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("\nCheck your .env file against .env.example.\n");
  process.exit(1);
}

// Catch the most common first-run mistake: .env still has the placeholder
// text. Prisma's own error for this is cryptic, so fail here with a clear one.
if (parsed.data.DATABASE_URL.includes("PASTE HERE")) {
  console.error(
    "\nDATABASE_URL is still the placeholder.\n" +
      "Open .env and paste your Neon connection strings.\n" +
      "See DATABASE_SETUP.md step 2.\n"
  );
  process.exit(1);
}

if (!parsed.data.DATABASE_URL.startsWith("postgres")) {
  console.error(
    "\nDATABASE_URL does not look like a PostgreSQL connection string.\n" +
      "It should begin with postgresql://\n"
  );
  process.exit(1);
}

// Refuse to boot production with the placeholder secrets from .env.example.
if (
  parsed.data.NODE_ENV === "production" &&
  parsed.data.JWT_ACCESS_SECRET.includes("replace-with")
) {
  console.error("Refusing to start: JWT secrets are still placeholders.");
  process.exit(1);
}

// Derived once here so no other module has to re-check three variables to
// answer "can we send email?".
const MAIL_ENABLED = Boolean(
  parsed.data.SMTP_HOST && parsed.data.SMTP_USER && parsed.data.SMTP_PASS
);

// In production, silently logging reset links to a console nobody reads means
// password reset is quietly broken for every user. Fail loudly at boot.
if (parsed.data.NODE_ENV === "production" && !MAIL_ENABLED) {
  console.error(
    "\nRefusing to start: SMTP_HOST, SMTP_USER and SMTP_PASS are required in\n" +
      "production, otherwise password reset emails cannot be delivered.\n"
  );
  process.exit(1);
}

if (parsed.data.NODE_ENV === "development" && !MAIL_ENABLED) {
  console.warn(
    "[mail] SMTP not configured — password reset links will be printed here."
  );
}

// Same pattern as MAIL_ENABLED: answer "can we take payments?" in one place
// rather than re-checking two variables at every call site.
const PAYMENTS_ENABLED = Boolean(
  parsed.data.RAZORPAY_KEY_ID && parsed.data.RAZORPAY_KEY_SECRET
);

// A production storefront that cannot take money is not a storefront. Fail at
// boot rather than at a customer's checkout.
if (parsed.data.NODE_ENV === "production" && !PAYMENTS_ENABLED) {
  console.error(
    "\nRefusing to start: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required\n" +
      "in production, otherwise checkout cannot create payment orders.\n"
  );
  process.exit(1);
}

// Without this secret, webhook signatures cannot be verified — and an
// unverified webhook endpoint lets anyone POST "payment captured" and receive
// goods for free. Refusing to boot is the only safe default.
if (parsed.data.NODE_ENV === "production" && !parsed.data.RAZORPAY_WEBHOOK_SECRET) {
  console.error(
    "\nRefusing to start: RAZORPAY_WEBHOOK_SECRET is required in production.\n" +
      "Without it, payment webhooks cannot be verified and orders could be\n" +
      "marked paid by anyone who finds the endpoint.\n"
  );
  process.exit(1);
}

if (parsed.data.NODE_ENV !== "production" && !PAYMENTS_ENABLED) {
  console.warn(
    "[payments] Razorpay not configured — checkout will run in mock mode."
  );
}

// Cookies sent cross-site (Vercel frontend -> Render API) need SameSite=None,
// and browsers reject SameSite=None without Secure. Catch that combination at
// boot instead of debugging "login works locally but not in production".
if (parsed.data.NODE_ENV === "production" && !parsed.data.COOKIE_SECURE) {
  console.error(
    "\nRefusing to start: COOKIE_SECURE must be true in production, otherwise\n" +
      "the refresh-token cookie is sent over plaintext HTTP.\n"
  );
  process.exit(1);
}

module.exports = { ...parsed.data, MAIL_ENABLED, PAYMENTS_ENABLED };
