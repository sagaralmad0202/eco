const { z } = require("zod");

const createOrderSchema = z.object({
  addressId: z.string().uuid("Not a valid address id"),
  couponCode: z
    .string()
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(50, "Coupon code is too long")
    .toUpperCase()
    .optional(),
});

const orderIdParamSchema = z.object({
  id: z.string().uuid("Not a valid order id"),
});

const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema,
  listOrdersSchema,
};
