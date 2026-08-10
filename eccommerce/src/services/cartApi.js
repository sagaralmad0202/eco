import api from "./api";

/**
 * Cart endpoints.
 *
 * Every one of these depends on cookies reaching the server: guests are
 * identified by an httpOnly `cart_session` cookie the backend mints on first
 * contact. `withCredentials: true` is set once on the shared axios instance in
 * ./api.js — if it is ever removed, every call here silently starts a brand
 * new cart and the basket appears to empty itself between requests.
 *
 * All of these return the whole cart, so there is never a need to follow a
 * mutation with a GET.
 *
 * Money in the response (`price`, `lineTotal`, `subtotal`) arrives as a
 * two-decimal STRING. Format it for display; only convert to a number at the
 * last moment, and never accumulate totals client-side when the server already
 * sent one.
 */
export const cartApi = {
  /**
   * Read the current cart. Never creates a row server-side, so it is safe to
   * call on every page load. A visitor with no cart gets `{ id: null,
   * items: [], totalQuantity: 0, subtotal: "0.00" }`.
   */
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  /**
   * Add a variant to the cart.
   *
   * `variantId`, not `productId` — price and stock live on the variant, so
   * "add the product" has no answer once there is more than one size.
   *
   * Adding a variant already in the cart increments it rather than adding a
   * second line, and the stock check runs against the resulting total.
   *
   * @param {Object} payload - { variantId, quantity = 1 } (quantity max 20)
   */
  async addItem({ variantId, quantity = 1 }) {
    const response = await api.post("/cart/items", { variantId, quantity });
    return response.data;
  },

  /**
   * Change the quantity of one line.
   *
   * @param {string} itemId - the CART ITEM id, not the variant id
   * @param {number} quantity
   */
  async updateItem(itemId, quantity) {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /** Remove one line. `itemId` is the cart item id. */
  async removeItem(itemId) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /** Empty the cart. Clearing an already-empty cart is a success, not a 404. */
  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartApi;
