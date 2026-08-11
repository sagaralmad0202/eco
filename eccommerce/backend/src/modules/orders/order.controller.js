const asyncHandler = require("../../utils/asyncHandler");
const orderService = require("./order.service");

const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await orderService.listOrders(req.user.id, req.query);
  res.json({ success: true, ...result });
});

const get = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.user.id, req.params.id);
  res.json({ success: true, data: order });
});

const cancel = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

module.exports = { create, list, get, cancel };
