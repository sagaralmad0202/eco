const cacheService = require("./cacheService");
const { cacheKeys, hashQuery } = require("./cacheKeys");
const cacheEventEmitter = require("./cacheEventEmitter");
const cacheInspector = require("./cacheInspector");

// Standard recommended TTLs (in seconds)
const CACHE_TTL = {
  PRODUCT_DETAIL: 600, // 10 minutes
  PRODUCT_LIST: 180, // 3 minutes
  CATEGORY_TREE: 1800, // 30 minutes
  REVIEW_SUMMARY: 900, // 15 minutes
  USER_PROFILE: 300, // 5 minutes
};

module.exports = {
  ...cacheService,
  cacheKeys,
  hashQuery,
  CACHE_TTL,
  cacheEventEmitter,
  cacheInspector,
};
