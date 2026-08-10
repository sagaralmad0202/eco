const { z } = require("zod");

// The PRODUCT, not a variant — a wishlist saves the thing, and the size is
// chosen at purchase time.
const addItemSchema = z.object({
  productId: z.string().uuid("Not a valid product id"),
});

const productIdParamSchema = z.object({
  productId: z.string().uuid("Not a valid product id"),
});

module.exports = { addItemSchema, productIdParamSchema };
