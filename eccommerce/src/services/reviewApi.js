import api from "./api";

/**
 * Review API service.
 *
 * All review operations are backend-driven:
 * - Public: Read reviews, read summary, get single review
 * - Authenticated: Create review, update own review, delete own review
 */
export const reviewApi = {
  /**
   * Fetch paginated and sorted reviews for a product.
   *
   * @param {string} productId - The product UUID
   * @param {Object} [params] - { page, limit, sort, rating }
   *   sort options: "newest" | "oldest" | "highest_rating" | "lowest_rating"
   * @returns {Promise<{success: boolean, data: { reviews: Array, pagination: Object }}>}
   */
  async getProductReviews(productId, params = {}) {
    if (!productId) {
      throw new Error("Product ID is required to fetch reviews");
    }
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  /**
   * Fetch review summary and statistics (average rating, count, distribution).
   *
   * @param {string} productId - The product UUID
   * @returns {Promise<{success: boolean, data: { averageRating: number, totalReviews: number, ratingDistribution: Object }}>}
   */
  async getReviewSummary(productId) {
    if (!productId) {
      throw new Error("Product ID is required to fetch review summary");
    }
    const response = await api.get(`/products/${productId}/reviews/summary`);
    return response.data;
  },

  /**
   * Create a new review for a product by the authenticated user.
   * Note: userId is derived automatically from the auth token on the backend.
   *
   * @param {string} productId - The product UUID
   * @param {Object} data - { rating: number (1-5), comment: string, title?: string }
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async createReview(productId, data) {
    if (!productId) {
      throw new Error("Product ID is required to submit a review");
    }
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  /**
   * Fetch a single review by its UUID.
   *
   * @param {string} reviewId
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getReview(reviewId) {
    if (!reviewId) {
      throw new Error("Review ID is required");
    }
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Update the authenticated user's own review.
   *
   * @param {string} reviewId
   * @param {Object} data - { rating?: number, comment?: string, title?: string }
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async updateReview(reviewId, data) {
    if (!reviewId) {
      throw new Error("Review ID is required to update a review");
    }
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  /**
   * Delete the authenticated user's own review.
   *
   * @param {string} reviewId
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteReview(reviewId) {
    if (!reviewId) {
      throw new Error("Review ID is required to delete a review");
    }
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default reviewApi;
