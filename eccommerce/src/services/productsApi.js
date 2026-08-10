import api from "./api";

export const productsApi = {
  /**
   * List catalogue products.
   *
   * Note the response shape: `items` and `pagination` are SIBLINGS of
   * `success`, not nested under `data` like every other endpoint. That is
   * deliberate on the backend, so callers here read `response.data.items`.
   *
   * @param {Object} [params] - page, limit (max 50), search, category (slug),
   *   brand, minPrice, maxPrice, sort ("newest" | "price_asc" | "price_desc" |
   *   "name_asc"), inStock, featured
   * @returns {Promise<{success: boolean, items: Array, pagination: Object}>}
   */
  async list(params = {}) {
    const response = await api.get("/products", { params });
    return response.data;
  },

  /**
   * The home page's curated rail. Returns an empty list until products are
   * flagged `isFeatured` in the database — an empty rail here means nothing is
   * featured yet, not that the request failed.
   */
  async listFeatured({ limit = 8, ...rest } = {}) {
    return productsApi.list({ featured: true, limit, ...rest });
  },

  /**
   * Newest arrivals. Used by the rails that should not repeat whatever the
   * featured rail is already showing.
   */
  async listNewest({ limit = 12, ...rest } = {}) {
    return productsApi.list({ sort: "newest", limit, ...rest });
  },

  /**
   * Full product detail: every image, every active variant, the ten most
   * recent reviews and an aggregate rating.
   *
   * The list endpoint returns only one image and no rating, so quick view and
   * the gallery need this call rather than reusing a list row.
   *
   * @param {string} slug
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getBySlug(slug) {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  /**
   * Category tree with `productCount` on every node. A parent's count already
   * includes its children's, so do not sum them again.
   */
  async listCategories() {
    const response = await api.get("/products/categories");
    return response.data;
  },
};

export default productsApi;
