import { apiRequest } from './api-client';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    price?: string;
  };
}

export const wishlistApi = {
  /**
   * List all products currently in the user's wishlist.
   */
  async list(): Promise<{ success: boolean; data: WishlistItem[] }> {
    return apiRequest<{ success: boolean; data: WishlistItem[] }>('/wishlist', {
      method: 'GET',
    });
  },

  /**
   * Toggle item in wishlist (idempotent add or remove).
   */
  async toggle(productId: string): Promise<{ success: boolean; action: 'added' | 'removed' }> {
    return apiRequest<{ success: boolean; action: 'added' | 'removed' }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
};

export default wishlistApi;
