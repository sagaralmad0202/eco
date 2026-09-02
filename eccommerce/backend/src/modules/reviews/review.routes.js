const express = require("express");

const validate = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const controller = require("./review.controller");
const {
  productIdParamSchema,
  reviewIdParamSchema,
  listReviewsQuerySchema,
  createReviewSchema,
  updateReviewSchema,
} = require("./review.validators");

// ---- Product-scoped routes (/products/:productId/reviews) ----
//
// Mounted by the route index UNDER the products prefix, so these paths are
// relative to /api/products/:productId/reviews.

const productReviewRouter = express.Router({ mergeParams: true });

// Public — anyone browsing the catalogue can read reviews.
productReviewRouter.get(
  "/",
  validate(productIdParamSchema, "params"),
  validate(listReviewsQuerySchema, "query"),
  controller.listReviews,
);

productReviewRouter.get(
  "/summary",
  validate(productIdParamSchema, "params"),
  controller.getReviewSummary,
);

// Creating a review requires authentication.
productReviewRouter.post(
  "/",
  authenticate,
  validate(productIdParamSchema, "params"),
  validate(createReviewSchema),
  controller.createReview,
);

// ---- Review-scoped routes (/reviews/:reviewId) ----
//
// Mounted at /api/reviews. Operations on an existing review are addressed by
// its own id, not the product's.

const reviewRouter = express.Router();

// Public — a direct link to a single review should work without login.
reviewRouter.get(
  "/:reviewId",
  validate(reviewIdParamSchema, "params"),
  controller.getReview,
);

// Update and delete require authentication and ownership (enforced in service).
reviewRouter.patch(
  "/:reviewId",
  authenticate,
  validate(reviewIdParamSchema, "params"),
  validate(updateReviewSchema),
  controller.updateReview,
);

reviewRouter.delete(
  "/:reviewId",
  authenticate,
  validate(reviewIdParamSchema, "params"),
  controller.deleteReview,
);

module.exports = { productReviewRouter, reviewRouter };
