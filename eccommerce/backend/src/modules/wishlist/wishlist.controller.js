const asyncHandler = require("../../utils/asyncHandler");
const wishlistService = require("./wishlist.service");

const list = asyncHandler(async (req, res) => {
  const items = await wishlistService.listWishlist(req.user.id);
  res.json({ success: true, data: items });
});

const addItem = asyncHandler(async (req, res) => {
  const items = await wishlistService.addItem(req.user.id, req.body);
  res.status(201).json({ success: true, data: items });
});

const removeItem = asyncHandler(async (req, res) => {
  const items = await wishlistService.removeItem(
    req.user.id,
    req.params.productId,
  );
  res.json({ success: true, data: items });
});

// `saved` tells the card which way the heart should now point, so it does not
// have to infer it from the list length.
const toggle = asyncHandler(async (req, res) => {
  const { saved, items } = await wishlistService.toggleItem(
    req.user.id,
    req.body,
  );
  res.json({ success: true, saved, data: items });
});

const clear = asyncHandler(async (req, res) => {
  const removedCount = await wishlistService.clearWishlist(req.user.id);
  res.json({
    success: true,
    data: [],
    meta: { removedCount },
  });
});

module.exports = { list, addItem, removeItem, toggle, clear };
