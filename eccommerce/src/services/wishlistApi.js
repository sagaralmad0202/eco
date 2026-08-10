import api from "./api";

/**
 * Wishlist endpoints.
 *
 * Every route requires a signed-in user — a wishlist has no expiry and no
 * checkout to flush it, so it follows the account rather than the browser.
 * Callers must handle 401 by prompting for sign-in rather than showing an
 * error; an anonymous visitor clicking a heart is a normal event, not a fault.
 *
 * A wishlist saves PRODUCTS, not variants: hearting a jacket means "I want
 * this jacket", not "the blue one in medium".
 */
export const wishlistApi = {
  /** Saved products, newest first. */
  async getWishlist() {
    const response = await api.get("/wishlist");
    return response.data;
  },

  /**
   * Add or remove in one call, depending on what is already saved.
   *
   * This is what product cards should use. It returns `saved: true|false`
   * telling you which way the heart should now point, plus the full updated
   * list — so a card holding stale state cannot produce an "already saved"
   * error.
   *
   * @param {string} productId
   * @returns {Promise<{success: boolean, saved: boolean, data: Array}>}
   */
  async toggle(productId) {
    const response = await api.post("/wishlist/toggle", { productId });
    return response.data;
  },

  /** Add-only. Saving something already saved is an upsert, not an error. */
  async addItem(productId) {
    const response = await api.post("/wishlist/items", { productId });
    return response.data;
  },

  /** Remove. Keyed by PRODUCT id, not the wishlist row id. */
  async removeItem(productId) {
    const response = await api.delete(`/wishlist/items/${productId}`);
    return response.data;
  },
};

export default wishlistApi;
