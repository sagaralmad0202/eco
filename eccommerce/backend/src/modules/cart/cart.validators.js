const { z } = require("zod");

// Capped at 20 per line. A storefront that lets someone request 10,000 of one
// t-shirt is a storefront whose stock checks and payment totals get tested by
// accident in production.
const quantity = z.coerce
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(20, "You can add at most 20 of one item");

const addItemSchema = z.object({
  // The VARIANT, not the product: price and stock live on the variant, so
  // "add the product" has no single answer once there is more than one size.
  variantId: z.string().uuid("Not a valid product variant id"),
  quantity: quantity.default(1),
});

// Quantity is the only editable field. Changing which variant a line points at
// is a remove plus an add, and treating it as an update would sidestep the
// stock check on the new variant.
const updateItemSchema = z.object({
  quantity,
});

const itemIdParamSchema = z.object({
  id: z.string().uuid("Not a valid cart item id"),
});

module.exports = { addItemSchema, updateItemSchema, itemIdParamSchema };
