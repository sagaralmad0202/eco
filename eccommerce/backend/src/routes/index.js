const express = require("express");
const prisma = require("../lib/prisma");

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const productRoutes = require("../modules/products/product.routes");
const cartRoutes = require("../modules/cart/cart.routes");
const wishlistRoutes = require("../modules/wishlist/wishlist.routes");
const orderRoutes = require("../modules/orders/order.routes");
const addressRoutes = require("../modules/addresses/address.routes");
const paymentRoutes = require("../modules/payments/payment.routes");

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
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", addressRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
