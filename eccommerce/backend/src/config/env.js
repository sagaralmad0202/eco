// Loads .env and validates it BEFORE the app starts.
//
// Why: a missing JWT secret should crash the process on startup with a clear
// message, not silently sign tokens with "undefined" and fail at 2am.

require("dotenv").config();

const { z } = require("zod");

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
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
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

module.exports = parsed.data;
