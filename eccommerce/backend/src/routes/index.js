const express = require("express");
const prisma = require("../lib/prisma");

const authRoutes = require("../modules/auth/auth.routes");
const productRoutes = require("../modules/products/product.routes");

const router = express.Router();

// Health check. Actually queries the database rather than just returning
// "ok" — a health endpoint that passes while the database is unreachable
// is worse than none, because monitoring will stay green during an outage.
router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      message: err.message,
    });
  }
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

module.exports = router;
