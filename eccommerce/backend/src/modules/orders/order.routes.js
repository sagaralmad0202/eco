const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const {
  authenticate,
  requireVerifiedEmail,
} = require("../../middleware/authenticate");
const { idempotency } = require("../../middleware/idempotency");
const validate = require("../../middleware/validate");
const controller = require("./order.controller");
const {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
} = require("./order.validators");

// Every order route is limited before account authentication runs.
const router = createRateLimitedRouter("/api/orders", {
  middleware: [authenticate],
});

// Only verified users can place new orders. Viewing and cancelling are left
// accessible so an unverified user can still see their history.
//
// Idempotency is enforced on order creation: the client MUST supply an
// Idempotency-Key header. A retry with the same key returns the original
// order without reserving stock or consuming a coupon a second time.
router.post(
  "/",
  requireVerifiedEmail,
  idempotency(),
  validate(createOrderSchema),
  controller.create,
);

router.get("/", validate(listOrdersSchema, "query"), controller.list);
router.get("/history", validate(listOrdersSchema, "query"), controller.history);
router.get("/:id", validate(orderIdParamSchema, "params"), controller.get);
router.post(
  "/:id/cancel",
  validate(orderIdParamSchema, "params"),
  controller.cancel,
);

module.exports = router;
