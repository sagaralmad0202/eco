const asyncHandler = require("../../utils/asyncHandler");
const productService = require("./product.service");

// listProducts already returns { items, pagination }, so spread it rather than
// nesting under data — the frontend reads pagination as a sibling of items.
const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.validatedQuery || req.query);
  res.json({ success: true, ...result });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await productService.listCategories();
  res.json({ success: true, data: categories });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

module.exports = { listProducts, listCategories, getProductBySlug, createProduct };
