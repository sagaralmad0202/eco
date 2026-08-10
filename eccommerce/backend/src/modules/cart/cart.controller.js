const asyncHandler = require("../../utils/asyncHandler");
const cartService = require("./cart.service");

// req.cartOwner is set by the cartSession middleware: { userId } for a
// signed-in customer, { sessionId } for a guest. Handlers never build it
// themselves, so no route can accidentally read an owner from the body.

const get = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.cartOwner);
  res.json({ success: true, data: cart });
});

// Returns the whole cart, not just the added line. The drawer needs the new
// subtotal and badge count anyway, and one response avoids a follow-up GET
// that could race with a second add.
const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.cartOwner, req.body);
  res.status(201).json({ success: true, data: cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(
    req.cartOwner,
    req.params.id,
    req.body
  );
  res.json({ success: true, data: cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.cartOwner, req.params.id);
  res.json({ success: true, data: cart });
});

const clear = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.cartOwner);
  res.json({ success: true, data: cart });
});

module.exports = { get, addItem, updateItem, removeItem, clear };
