const express = require("express");

const validate = require("../../middleware/validate");
const { optionalAuth } = require("../../middleware/authenticate");
const { cartSession } = require("../../middleware/cartSession");
const controller = require("./cart.controller");
const {
  addItemSchema,
  updateItemSchema,
  itemIdParamSchema,
} = require("./cart.validators");

const router = express.Router();

// optionalAuth then cartSession, in that order and for every route.
//
// The order matters: cartSession checks req.user to decide whether the visitor
// needs a guest cookie, so it has to run after the token has been read.
// Reversing them would mint a throwaway guest cart for every signed-in
// customer.
//
// Applied with router.use rather than per-route so a cart endpoint added later
// cannot end up without an owner — which would land in ownerWhere's
// "no cart session" error rather than failing loudly here.
//
// Known consequence of optionalAuth on the write routes: a customer whose
// access token has expired is treated as a guest, so an add lands in a guest
// cart and their real one appears not to have changed. That is the accepted
// trade — rejecting instead would turn an expired token into a failed add, and
// the cart is the last place to make a customer re-authenticate mid-action.
// The frontend's job is to refresh on 401 and retry before it gets here; the
// merge on next login folds the stray guest cart back in either way.
router.use(optionalAuth, cartSession);

router.get("/", controller.get);

router.post("/items", validate(addItemSchema), controller.addItem);

router.patch(
  "/items/:id",
  validate(itemIdParamSchema, "params"),
  validate(updateItemSchema),
  controller.updateItem
);

router.delete(
  "/items/:id",
  validate(itemIdParamSchema, "params"),
  controller.removeItem
);

// Re-checks the whole cart against current stock, dropping lines that can no
// longer be bought and clamping the rest. Meant to be called right before
// payment is started.
//
// No validate() because there is no body: the cart is identified by the cookie
// or the token, never by anything the client sends. Accepting a cart id here
// would be the one way to let someone else's basket be edited.
router.post("/validate", controller.validateCart);

// Declared after /items/:id so there is no ambiguity about which matches what.
router.delete("/", controller.clear);

module.exports = router;
