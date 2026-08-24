const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./product.controller");
const { listProductsSchema, slugParamSchema } = require("./product.validators");

const router = express.Router();

// All public read-only endpoints — no authentication required.

router.get("/", validate(listProductsSchema, "query"), controller.listProducts);

router.post("/", controller.createProduct);

router.get("/categories", controller.listCategories);

// Declared AFTER /categories, otherwise "categories" would be captured
// as a :slug and this route would shadow it.
router.get(
  "/:slug",
  validate(slugParamSchema, "params"),
  controller.getProductBySlug,
);

module.exports = router;
