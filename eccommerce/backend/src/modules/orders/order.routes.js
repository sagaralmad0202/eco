const express = require("express");

const {
  authenticate,
  requireVerifiedEmail,
} = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./order.controller");
const {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
} = require("./order.validators");

const router = express.Router();

// Every order operation is account-private. Applying auth once at router level
// makes it impossible to accidentally add a public order endpoint later.
router.use(authenticate);

// Only verified users can place new orders. Viewing and cancelling are left
// accessible so an unverified user can still see their history.
router.post(
  "/",
  requireVerifiedEmail,
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
