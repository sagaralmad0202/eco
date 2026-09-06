const express = require("express");
const { createRateLimiterMiddleware } = require("../../middleware/rateLimiter");

function createRateLimitedRouter(base, { middleware = [], ...options } = {}) {
  const router = express.Router(options);
  const registerRoute = router.route.bind(router);
  // Wrap the public registration API, not Express's private routing stack.
  // Express still matches/decodes paths. Capture declared mount/route patterns,
  // before req.baseUrl can contain dynamic IDs. Admission precedes shared auth.
  router.route = (path) => {
    if (typeof path !== "string")
      throw new TypeError("Rate-limited routes require a named string pattern");
    const route = registerRoute(path);
    for (const method of [
      "get",
      "head",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "all",
    ]) {
      const register = route[method].bind(route);
      route[method] = (...handlers) =>
        register(
          createRateLimiterMiddleware({
            method: method === "all" ? undefined : method,
            route: `${base}${path === "/" ? "" : path}`,
          }),
          ...middleware,
          ...handlers,
        );
    }
    return route;
  };
  return router;
}
module.exports = { createRateLimitedRouter };
