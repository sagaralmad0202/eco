const express = require("express");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./address.controller");
const {
  createAddressSchema,
  updateAddressSchema,
  idParamSchema,
} = require("./address.validators");

const router = express.Router();

// An address book is private by definition — every route below requires a
// session. Applied once here rather than per-route so a new endpoint cannot
// be added without it by accident.
router.use(authenticate);

router.get("/", controller.list);

router.post("/", validate(createAddressSchema), controller.create);

router.get("/:id", validate(idParamSchema, "params"), controller.get);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAddressSchema),
  controller.update
);

router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

module.exports = router;
