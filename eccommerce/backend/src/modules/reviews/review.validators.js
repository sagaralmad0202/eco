const { z } = require("zod");

// ---------- Param schemas ----------

const productIdParamSchema = z.object({
  productId: z.string().trim().min(1, "Product identifier is required"),
});

const reviewIdParamSchema = z.object({
  reviewId: z.string().uuid("Not a valid review id"),
});

// ---------- Query schema ----------

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z
    .enum(["newest", "oldest", "highest_rating", "lowest_rating"])
    .default("newest"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

// ---------- Body schemas ----------

const createReviewSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string({ required_error: "Review comment is required" })
    .trim()
    .min(1, "Review comment cannot be empty")
    .max(2000, "Review comment must be 2000 characters or fewer"),
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or fewer")
    .optional(),
});

// At least one field must be present. refine() runs after parsing, so an empty
// body that passes the shape check still gets a clear validation message.
const updateReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5")
      .optional(),
    comment: z
      .string()
      .trim()
      .min(1, "Review comment cannot be empty")
      .max(2000, "Review comment must be 2000 characters or fewer")
      .optional(),
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title must be 200 characters or fewer")
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.rating !== undefined ||
      data.comment !== undefined ||
      data.title !== undefined,
    { message: "At least one field (rating, comment, or title) is required" },
  );

module.exports = {
  productIdParamSchema,
  reviewIdParamSchema,
  listReviewsQuerySchema,
  createReviewSchema,
  updateReviewSchema,
};
