import { apiRequest } from './api-client';

export interface ReviewAuthor {
  id?: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: ReviewAuthor;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const reviewsApi = {
  /**
   * Fetch paginated and sorted reviews for a product (by ID or slug).
   */
  async getProductReviews(
    productId: string,
    params: { page?: number; limit?: number; sort?: string; rating?: number } = {}
  ): Promise<{ success: boolean; data: { reviews: ReviewItem[]; pagination: ReviewPagination } }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.sort) query.append('sort', params.sort);
    if (params.rating) query.append('rating', String(params.rating));

    const qs = query.toString();
    const endpoint = `/products/${encodeURIComponent(productId)}/reviews${qs ? `?${qs}` : ''}`;
    return apiRequest<{ success: boolean; data: { reviews: ReviewItem[]; pagination: ReviewPagination } }>(endpoint);
  },

  /**
   * Fetch review summary statistics (average, count, star distribution).
   */
  async getReviewSummary(productId: string): Promise<{ success: boolean; data: ReviewSummary }> {
    const endpoint = `/products/${encodeURIComponent(productId)}/reviews/summary`;
    return apiRequest<{ success: boolean; data: ReviewSummary }>(endpoint);
  },

  /**
   * Create a new review for a product. (Requires login)
   */
  async createReview(
    productId: string,
    payload: { rating: number; comment: string; title?: string }
  ): Promise<{ success: boolean; data: ReviewItem }> {
    const endpoint = `/products/${encodeURIComponent(productId)}/reviews`;
    return apiRequest<{ success: boolean; data: ReviewItem }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing review created by the authenticated user.
   */
  async updateReview(
    reviewId: string,
    payload: { rating?: number; comment?: string; title?: string | null }
  ): Promise<{ success: boolean; data: ReviewItem }> {
    const endpoint = `/reviews/${encodeURIComponent(reviewId)}`;
    return apiRequest<{ success: boolean; data: ReviewItem }>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete an existing review created by the authenticated user.
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    const endpoint = `/reviews/${encodeURIComponent(reviewId)}`;
    return apiRequest<{ success: boolean; message: string }>(endpoint, {
      method: 'DELETE',
    });
  },
};

export default reviewsApi;
