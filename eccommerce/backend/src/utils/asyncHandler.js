// Express 4 does not catch errors thrown inside async route handlers —
// they become unhandled promise rejections and the request hangs forever.
//
// Wrapping every async handler in this forwards the error to next()
// so the central error handler can deal with it.
//
//   router.get("/", asyncHandler(async (req, res) => { ... }));

module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
