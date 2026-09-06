const { createRateLimitedRouter } = require("../../lib/rateLimiter/router");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./address.controller");
const {
  createAddressSchema,
  updateAddressSchema,
  idParamSchema,
} = require("./address.validators");

// Every address route is limited before account authentication runs.
const router = createRateLimitedRouter("/api/addresses", {
  middleware: [authenticate],
});

router.get("/", controller.list);

router.post("/", validate(createAddressSchema), controller.create);

router.get("/:id", validate(idParamSchema, "params"), controller.get);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAddressSchema),
  controller.update,
);

router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

module.exports = router;
