// Loads .env and validates it BEFORE the app starts.
//
// Why: a missing JWT secret should crash the process on startup with a clear
// message, not silently sign tokens with "undefined" and fail at 2am.

const path = require("path");

// Resolve the backend env file independently of the shell's working directory.
// This keeps payment configuration available whether the API is launched from
// backend/ directly or from the repository root (for example by an IDE task).
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

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
    z.string().min(1).default("http://localhost:3000"),
  ),
  PUBLIC_API_ORIGIN: blankToUndefined(
    z.string().url().default("http://localhost:5000"),
  ),

  // "warn" in production keeps the noise down; "debug" while developing.
  LOG_LEVEL: blankToUndefined(
    z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
  ),

  // Set true only when the API is served over HTTPS. A Secure cookie is
  // silently dropped by the browser over plain http, which would break login
  // on localhost with no visible error.
  COOKIE_SECURE: blankToUndefined(
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default("false"),
  ),

  // Razorpay. Optional in development so the API boots without an account,
  // but checked below and required in production — see the guard further down.
  // This application is intentionally TEST-MODE ONLY. Refusing a live-key
  // prefix at boot is safer than relying on a dashboard toggle or memory.
  RAZORPAY_KEY_ID: blankToUndefined(
    z
      .string()
      .startsWith("rzp_test_", "Only Razorpay TEST MODE keys are allowed")
      .optional(),
  ),
  RAZORPAY_KEY_SECRET: blankToUndefined(z.string().optional()),

  // Email is optional on purpose. With no SMTP_HOST the app still runs and
  // password reset links are logged to the console — a fresher cloning this
  // repo should not need a mail server before they can log in.
  SMTP_HOST: blankToUndefined(z.string().optional()),
  SMTP_PORT: blankToUndefined(z.coerce.number().int().positive().default(587)),
  SMTP_USER: blankToUndefined(z.string().optional()),
  SMTP_PASS: blankToUndefined(z.string().optional()),
  MAIL_FROM: blankToUndefined(
    z.string().default("Ciseco Support <no-reply@ciseco.local>"),
  ),

  PASSWORD_RESET_EXPIRES_IN: blankToUndefined(duration.default("30m")),

  // ---------------------- SOCIAL LOGIN (OAuth) ----------------------
  //
  // Per-provider credentials from the provider's developer console. All
  // optional: with none configured the OAuth endpoints answer 503 instead of
  // redirecting to a provider that would only reject the request.
  //
  // Redirect URIs default to `${PUBLIC_API_ORIGIN}/api/auth/oauth/<provider>/callback`
  // — override only if the backend is reachable on a different public URL.
  GOOGLE_CLIENT_ID: blankToUndefined(z.string().optional()),
  GOOGLE_CLIENT_SECRET: blankToUndefined(z.string().optional()),
  GOOGLE_REDIRECT_URI: blankToUndefined(z.string().url().optional()),

  FACEBOOK_CLIENT_ID: blankToUndefined(z.string().optional()),
  FACEBOOK_CLIENT_SECRET: blankToUndefined(z.string().optional()),
  FACEBOOK_REDIRECT_URI: blankToUndefined(z.string().url().optional()),

  TWITTER_CLIENT_ID: blankToUndefined(z.string().optional()),
  TWITTER_CLIENT_SECRET: blankToUndefined(z.string().optional()),
  TWITTER_REDIRECT_URI: blankToUndefined(z.string().url().optional()),

  // Lifetime of the one-time code the frontend swaps for app tokens after the
  // provider callback, and of the CSRF state row. Short: both only need to
  // survive the redirect round-trip.
  OAUTH_CODE_EXPIRES_IN: blankToUndefined(duration.default("2m")),
  OAUTH_STATE_EXPIRES_IN: blankToUndefined(duration.default("10m")),


  // ---------------------- LOGIN THROTTLE ----------------------
  //
  // Per-account brute-force protection, independent of IP. An attacker
  // rotating through a botnet bypasses IP-based rate limiting; these limits
  // track by normalised email instead.
  //
  // After LOGIN_MAX_ATTEMPTS failures within LOGIN_WINDOW_MS, the account is
  // temporarily blocked for LOGIN_BLOCK_DURATION_MS. The block is a cooldown,
  // not a permanent lockout, so it cannot be weaponised as a denial-of-service
  // against legitimate users.
  LOGIN_MAX_ATTEMPTS: blankToUndefined(
    z.coerce.number().int().positive().default(5),
  ),
  LOGIN_WINDOW_MS: blankToUndefined(
    z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000), // 15 min
  ),
  LOGIN_BLOCK_DURATION_MS: blankToUndefined(
    z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000), // 15 min
  ),

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

  // ---------------------- REDIS & DISTRIBUTED RATE LIMITING ----------------------
  //
  // Distributed Sliding Window Rate Limiting powered by Redis.
  // When running multiple backend instances behind a load balancer,
  // request state is shared in Redis Sorted Sets (ZSET) atomically evaluated
  // via a Lua script.
  REDIS_URL: blankToUndefined(z.string().default("redis://localhost:6379")),
  RATE_LIMIT_ENABLED: blankToUndefined(
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default("true"),
  ),
  // If Redis becomes unreachable, fail-open (true) allows customer traffic to continue
  // while logging structured warnings, rather than taking down the storefront.
  RATE_LIMIT_FAIL_OPEN: blankToUndefined(
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default("true"),
  ),
  RATE_LIMIT_WINDOW_SECONDS: blankToUndefined(
    z.coerce.number().int().positive().default(60),
  ),
  RATE_LIMIT_GENERAL_MAX_REQUESTS: blankToUndefined(
    z.coerce.number().int().positive().default(100),
  ),
  RATE_LIMIT_AUTH_MAX_REQUESTS: blankToUndefined(
    z.coerce.number().int().positive().default(5),
  ),
  RATE_LIMIT_WRITE_MAX_REQUESTS: blankToUndefined(
    z.coerce.number().int().positive().default(30),
  ),
  RATE_LIMIT_EXPENSIVE_MAX_REQUESTS: blankToUndefined(
    z.coerce.number().int().positive().default(5),
  ),
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
      "See DATABASE_SETUP.md step 2.\n",
  );
  process.exit(1);
}

if (!parsed.data.DATABASE_URL.startsWith("postgres")) {
  console.error(
    "\nDATABASE_URL does not look like a PostgreSQL connection string.\n" +
      "It should begin with postgresql://\n",
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
  parsed.data.SMTP_HOST && parsed.data.SMTP_USER && parsed.data.SMTP_PASS,
);

// In production, silently logging reset links to a console nobody reads means
// password reset is quietly broken for every user. Fail loudly at boot.
if (parsed.data.NODE_ENV === "production" && !MAIL_ENABLED) {
  console.error(
    "\nRefusing to start: SMTP_HOST, SMTP_USER and SMTP_PASS are required in\n" +
      "production, otherwise password reset emails cannot be delivered.\n",
  );
  process.exit(1);
}

if (parsed.data.NODE_ENV === "development" && !MAIL_ENABLED) {
  console.warn(
    "[mail] SMTP not configured — password reset links will be printed here.",
  );
}

// Same pattern as MAIL_ENABLED: answer "can we take payments?" in one place
// rather than re-checking two variables at every call site.
const PAYMENTS_ENABLED = Boolean(
  parsed.data.RAZORPAY_KEY_ID && parsed.data.RAZORPAY_KEY_SECRET,
);

// A production storefront that cannot take money is not a storefront. Fail at
// boot rather than at a customer's checkout.
if (parsed.data.NODE_ENV === "production" && !PAYMENTS_ENABLED) {
  console.error(
    "\nRefusing to start: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required\n" +
      "in production, otherwise checkout cannot create payment orders.\n",
  );
  process.exit(1);
}

if (parsed.data.NODE_ENV !== "production" && !PAYMENTS_ENABLED) {
  console.warn(
    "[payments] Razorpay TEST MODE is disabled until test credentials are configured.",
  );
}

// Cookies sent cross-site (Vercel frontend -> Render API) need SameSite=None,
// and browsers reject SameSite=None without Secure. Catch that combination at
// boot instead of debugging "login works locally but not in production".
if (parsed.data.NODE_ENV === "production" && !parsed.data.COOKIE_SECURE) {
  console.error(
    "\nRefusing to start: COOKIE_SECURE must be true in production, otherwise\n" +
      "the refresh-token cookie is sent over plaintext HTTP.\n",
  );
  process.exit(1);
}

// Same pattern as MAIL_ENABLED: a provider is "configured" only when BOTH its
// id and secret exist. Answered in one place so the OAuth routes can refuse
// cleanly instead of sending the user to a provider with empty credentials.
const OAUTH_PROVIDERS = {
  google: {
    enabled: Boolean(parsed.data.GOOGLE_CLIENT_ID && parsed.data.GOOGLE_CLIENT_SECRET),
    redirectUri:
      parsed.data.GOOGLE_REDIRECT_URI ||
      `${parsed.data.PUBLIC_API_ORIGIN}/api/auth/oauth/google/callback`,
  },
  facebook: {
    enabled: Boolean(
      parsed.data.FACEBOOK_CLIENT_ID && parsed.data.FACEBOOK_CLIENT_SECRET,
    ),
    redirectUri:
      parsed.data.FACEBOOK_REDIRECT_URI ||
      `${parsed.data.PUBLIC_API_ORIGIN}/api/auth/oauth/facebook/callback`,
  },
  twitter: {
    enabled: Boolean(
      parsed.data.TWITTER_CLIENT_ID && parsed.data.TWITTER_CLIENT_SECRET,
    ),
    redirectUri:
      parsed.data.TWITTER_REDIRECT_URI ||
      `${parsed.data.PUBLIC_API_ORIGIN}/api/auth/oauth/twitter/callback`,
  },
};

module.exports = { ...parsed.data, MAIL_ENABLED, PAYMENTS_ENABLED, OAUTH_PROVIDERS };
