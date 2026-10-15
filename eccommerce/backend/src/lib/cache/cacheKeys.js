const crypto = require("crypto");

/**
 * Normalizes query parameters into a deterministic, canonical JSON string,
 * then generates a short SHA256 hex digest for use in cache keys.
 *
 * This ensures that `/api/products?page=1&limit=10` and
 * `/api/products?limit=10&page=1` map to the EXACT same cache entry.
 */
function hashQuery(query = {}) {
  const sortedKeys = Object.keys(query).sort();
  const normalized = {};

  for (const key of sortedKeys) {
    const val = query[key];
    if (val !== undefined && val !== null && val !== "") {
      if (Array.isArray(val)) {
        normalized[key] = [...val].sort();
      } else {
        normalized[key] = String(val);
      }
    }
  }

  const json = JSON.stringify(normalized);
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 16);
}

/**
 * Cache Key Namespaces & Generators
 *
 * Format:
 * - Product Single:   cache:product:id:{productId} and cache:product:slug:{slug}
 * - Product List:     cache:products:list:{queryHash}
 * - Category Tree:    cache:categories:tree
 * - Review Summary:   cache:review:summary:{productId}
 * - User Profile:     cache:user:profile:{userId}
 */
const cacheKeys = {
  // Products
  productBySlug: (slug) => `cache:product:slug:${String(slug).toLowerCase()}`,
  productById: (id) => `cache:product:id:${id}`,
  productList: (query = {}) => `cache:products:list:${hashQuery(query)}`,
  allProductListsPattern: () => "cache:products:list:*",
  productWildcard: () => "cache:product:*",

  // Categories
  categoryTree: () => "cache:categories:tree",
  categoryWildcard: () => "cache:categories:*",

  // Reviews
  reviewSummary: (productId) => `cache:review:summary:${productId}`,
  reviewSummaryWildcard: () => "cache:review:summary:*",

  // User Profile
  userProfile: (userId) => `cache:user:profile:${userId}`,
};

module.exports = {
  hashQuery,
  cacheKeys,
};
