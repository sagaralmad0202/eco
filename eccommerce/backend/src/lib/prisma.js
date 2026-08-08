const { PrismaClient } = require("@prisma/client");
const env = require("../config/env");

// A single shared PrismaClient for the whole process.
//
// Creating a new PrismaClient per request opens a new connection pool each
// time and will exhaust Neon's connection limit within minutes. Always
// import this module instead of calling "new PrismaClient()".
//
// globalThis guard: nodemon reloads this file on every save in development,
// which would otherwise leak a pool per reload.

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
