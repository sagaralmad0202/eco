// Confirms the Prisma engine (not just pg) connects on both URLs.
// Reads credentials from .env only; never prints them.
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function test(label, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const r = await prisma.$queryRawUnsafe(
      "SELECT current_database() AS db, current_user AS usr, version() AS ver"
    );
    console.log(`OK    ${label}  ->  db=${r[0].db} user=${r[0].usr}`);
    console.log(`        ${r[0].ver.split(" on ")[0]}`);
    return true;
  } catch (e) {
    const m = String(e.message).split("\n").filter(Boolean).slice(-1)[0] || e.message;
    console.log(`FAIL  ${label}  ->  ${m.slice(0, 80)}`);
    return false;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

(async () => {
  const d = await test("DIRECT_URL   (migrations)", process.env.DIRECT_URL);
  const p = await test("DATABASE_URL (app)      ", process.env.DATABASE_URL);
  console.log(`\nsummary: direct=${d ? "OK" : "FAIL"} pooled=${p ? "OK" : "FAIL"}`);
  process.exit(d && p ? 0 : 1);
})();
