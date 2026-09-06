const express = require("express");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const { isRedisReady } = require("../lib/redis");

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const productRoutes = require("../modules/products/product.routes");
const cartRoutes = require("../modules/cart/cart.routes");
const wishlistRoutes = require("../modules/wishlist/wishlist.routes");
const orderRoutes = require("../modules/orders/order.routes");
const addressRoutes = require("../modules/addresses/address.routes");
const paymentRoutes = require("../modules/payments/payment.routes");
const {
  productReviewRouter,
  reviewRouter,
} = require("../modules/reviews/review.routes");

const uploadRoutes = require("../modules/upload/upload.routes");
const contactRoutes = require("../modules/contact/contact.routes");

const router = express.Router();

// Health check. Actually queries the database rather than just returning
// "ok" — a health endpoint that passes while the database is unreachable
// is worse than none, because monitoring will stay green during an outage.
router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status:
        env.RATE_LIMIT_ENABLED && !isRedisReady() ? "degraded" : "healthy",
      database: "connected",
      rateLimiter: !env.RATE_LIMIT_ENABLED
        ? "disabled"
        : isRedisReady()
          ? "ready"
          : "unavailable",
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
router.use("/users", userRoutes);
router.use("/account", userRoutes); // /api/account alias for REST convention
router.use("/upload", uploadRoutes); // /api/upload dedicated file upload API
router.use("/products", productRoutes);
router.use("/products/:productId/reviews", productReviewRouter);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", addressRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRouter);
router.use("/contact", contactRoutes);

module.exports = router;
