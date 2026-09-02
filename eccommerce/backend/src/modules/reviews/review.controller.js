const asyncHandler = require("../../utils/asyncHandler");
const reviewService = require("./review.service");

const listReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(
    req.params.productId,
    req.validatedQuery || req.query,
  );
  res.json({ success: true, data: result });
});

const getReviewSummary = asyncHandler(async (req, res) => {
  const summary = await reviewService.getReviewSummary(req.params.productId);
  res.json({ success: true, data: summary });
});

const getReview = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  res.json({ success: true, data: review });
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user.id,
    req.params.productId,
    req.body,
  );
  res.status(201).json({ success: true, data: review });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.user.id,
    req.params.reviewId,
    req.body,
  );
  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user.id, req.params.reviewId);
  res.json({ success: true, message: "Review deleted successfully" });
});

module.exports = {
  listReviews,
  getReviewSummary,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
