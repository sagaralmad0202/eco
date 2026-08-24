const express = require("express");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./user.controller");
const { updateProfileSchema } = require("./user.validators");

const router = express.Router();

// A profile is private by definition. Applied once at the router rather than
// per-route, so a future endpoint added below cannot be left unauthenticated by
// accident — the same reasoning as the addresses module.
router.use(authenticate);

router.get("/me/profile", controller.getProfile);

// PATCH, not PUT. The form sends only what it holds, and a PUT would mean any
// field the client omits is deliberately being cleared — one stale form would
// wipe a customer's phone number and date of birth.
router.patch(
  "/me/profile",
  validate(updateProfileSchema),
  controller.updateProfile,
);

module.exports = router;
