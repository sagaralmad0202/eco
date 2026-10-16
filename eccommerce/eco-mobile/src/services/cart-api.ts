import { apiRequest } from './api-client';

export interface CartItemVariant {
  id: string;
  title: string;
  sku?: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  inStock?: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    brand?: string;
  };
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  variant?: CartItemVariant;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  totalQuantity: number;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  adjustments?: Array<{
    variantId: string;
    title: string;
    reason: string;
    wasQuantity: number;
    nowQuantity: number;
  }>;
}

export const cartApi = {
  /**
   * Fetch current cart.
   * If visitor has no cart yet, backend returns an empty cart object.
   */
  async getCart(): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>('/cart', {
      method: 'GET',
    });
  },

  /**
   * Add a product variant to the cart.
   * @param payload { variantId: string, quantity?: number }
   */
  async addItem(payload: { variantId: string; quantity?: number }): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        variantId: payload.variantId,
        quantity: payload.quantity ?? 1,
      }),
    });
  },

  /**
   * Update the quantity of a cart line item.
   * @param itemId Cart item ID
   * @param quantity New quantity (1-20)
   */
  async updateItem(itemId: string, quantity: number): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Remove a line item from the cart.
   * @param itemId Cart item ID
   */
  async removeItem(itemId: string): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Empty the cart completely.
   */
  async clearCart(): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>('/cart', {
      method: 'DELETE',
    });
  },

  /**
   * Revalidate cart items and stock before checkout.
   */
  async validateCart(): Promise<{ success: boolean; data: Cart }> {
    return apiRequest<{ success: boolean; data: Cart }>('/cart/validate', {
      method: 'POST',
    });
  },
};

export default cartApi;
