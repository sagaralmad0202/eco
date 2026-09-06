const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");
const { authenticate } = require("../../middleware/authenticate");
const fileUpload = require("../../middleware/fileUpload");
const controller = require("./upload.controller");

const router = createRateLimitedRouter("/api/upload");

// Authenticated file upload endpoint: POST /api/upload
router.post("/", authenticate, fileUpload, controller.uploadFile);

// Also support POST /api/upload/image
router.post("/image", authenticate, fileUpload, controller.uploadFile);

module.exports = router;
