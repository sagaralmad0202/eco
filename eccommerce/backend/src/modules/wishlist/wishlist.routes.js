const express = require("express");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./wishlist.controller");
const {
  addItemSchema,
  productIdParamSchema,
} = require("./wishlist.validators");

const router = express.Router();

// Unlike the cart, a wishlist requires a session on every route.
//
// A guest wishlist would need somewhere to live, and the honest answer for a
// list with no expiry and no checkout to flush it is "an account". The cart
// earns its guest path because abandoning a basket at the sign-in wall costs a
// sale; a heart click does not, and the sign-in prompt it triggers is how
// stores get people to register in the first place.
router.use(authenticate);

router.get("/", controller.list);

router.post("/items", validate(addItemSchema), controller.addItem);

// The one the product cards call. Idempotent in both directions, so a stale
// page cannot produce an "already saved" error.
router.post("/toggle", validate(addItemSchema), controller.toggle);

router.delete(
  "/items/:productId",
  validate(productIdParamSchema, "params"),
  controller.removeItem
);

module.exports = router;
