const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const service = require("./product.service");
const {
  listProductsSchema,
  slugParamSchema,
} = require("./product.validators");

const router = express.Router();

// All public read-only endpoints — no authentication required.

router.get(
  "/",
  validate(listProductsSchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await service.listProducts(req.query);
    res.json({ success: true, ...result });
  })
);

router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await service.listCategories();
    res.json({ success: true, data: categories });
  })
);

// Declared AFTER /categories, otherwise "categories" would be captured
// as a :slug and this route would shadow it.
router.get(
  "/:slug",
  validate(slugParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const product = await service.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  })
);

module.exports = router;
