const express = require("express");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./redisMonitor.controller");

const router = express.Router();

// Require administrative privileges for all monitoring and inspection endpoints.
// In development, also permits authenticated developer sessions.
const requireAdminOrDev = (req, res, next) => {
  if (req.user?.role === "ADMIN" || env.NODE_ENV === "development") {
    return next();
  }
  return next(ApiError.forbidden("You do not have access to this resource"));
};

router.use(authenticate, requireAdminOrDev);

// Real-time overview & SSE live stream
router.get("/overview", controller.getOverview);
router.get("/events", controller.streamEvents);
router.get("/events/recent", controller.getRecentEvents);

// Key Explorer and Deep Inspector
router.get("/keys", controller.getKeys);
router.get("/keys/:key", controller.inspectKey);
router.get("/lifecycle/:key", controller.getKeyLifecycle);

// Historical Performance Analytics
router.get("/analytics", controller.getAnalytics);

// Safe Administrative Actions
router.post("/keys/delete", controller.deleteKey);
router.post("/keys/invalidate", controller.invalidatePattern);

module.exports = router;
