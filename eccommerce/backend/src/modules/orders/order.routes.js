const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
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

router.post("/", validate(createOrderSchema), controller.create);
router.get("/", validate(listOrdersSchema, "query"), controller.list);
router.get("/:id", validate(orderIdParamSchema, "params"), controller.get);
router.post(
  "/:id/cancel",
  validate(orderIdParamSchema, "params"),
  controller.cancel,
);

module.exports = router;
