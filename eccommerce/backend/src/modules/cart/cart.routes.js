const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const validate = require("../../middleware/validate");
const { optionalAuth } = require("../../middleware/authenticate");
const { cartSession } = require("../../middleware/cartSession");
const controller = require("./cart.controller");
const {
  addItemSchema,
  updateItemSchema,
  itemIdParamSchema,
} = require("./cart.validators");

// Limit each route before resolving the account and then the cart owner.
// Expired bearer tokens return 401 so the client can refresh and retry;
// requests without a bearer token receive a guest cart session.
const router = createRateLimitedRouter("/api/cart", {
  middleware: [optionalAuth, cartSession],
});

router.get("/", controller.get);

router.post("/items", validate(addItemSchema), controller.addItem);

router.patch(
  "/items/:id",
  validate(itemIdParamSchema, "params"),
  validate(updateItemSchema),
  controller.updateItem,
);

router.delete(
  "/items/:id",
  validate(itemIdParamSchema, "params"),
  controller.removeItem,
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
