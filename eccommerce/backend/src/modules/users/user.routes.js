const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const avatarUpload = require("../../middleware/avatarUpload");
const controller = require("./user.controller");
const { updateProfileSchema } = require("./user.validators");

// Both /users and /account mounts use the same route identities and limits.
// Every profile route is limited before account authentication runs.
const router = createRateLimitedRouter("/api/users", {
  middleware: [authenticate],
});

router.get("/me/profile", controller.getProfile);
router.get("/", controller.getProfile);

// PATCH, not PUT. The form sends only what it holds, and a PUT would mean any
// field the client omits is deliberately being cleared — one stale form would
// wipe a customer's phone number and date of birth.
router.patch(
  "/me/profile",
  validate(updateProfileSchema),
  controller.updateProfile,
);
router.patch(
  "/",
  validate(updateProfileSchema),
  controller.updateProfile,
);
router.put(
  "/",
  validate(updateProfileSchema),
  controller.updateProfile,
);

// Avatar is multipart/form-data, not JSON, so it gets its own route rather than
// trying to mix binary data into the profile PATCH.
router.post("/me/avatar", avatarUpload, controller.uploadAvatar);
router.post("/avatar", avatarUpload, controller.uploadAvatar);

module.exports = router;
