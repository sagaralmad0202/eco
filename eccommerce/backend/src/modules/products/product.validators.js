const { z } = require("zod");

// Query params arrive as strings, so every numeric field is coerced.
const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // Capped at 50 on purpose: without a ceiling, "?limit=999999" becomes a
  // free denial-of-service against your own database.
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().optional(), // category slug
  categories: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  color: z.string().trim().optional(),
  colors: z.string().trim().optional(),
  size: z.string().trim().optional(),
  sizes: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "name_asc", "name_desc"])
    .default("newest"),
  inStock: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

module.exports = { listProductsSchema, slugParamSchema };
