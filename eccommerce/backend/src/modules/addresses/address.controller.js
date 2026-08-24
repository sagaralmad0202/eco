const asyncHandler = require("../../utils/asyncHandler");
const addressService = require("./address.service");

const list = asyncHandler(async (req, res) => {
  const addresses = await addressService.listAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

const get = asyncHandler(async (req, res) => {
  const address = await addressService.getAddress(req.user.id, req.params.id);
  res.json({ success: true, data: address });
});

const create = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).json({ success: true, data: address });
});

const update = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.id,
    req.body,
  );
  res.json({ success: true, data: address });
});

const remove = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id);
  res.json({ success: true, message: "Address deleted" });
});

module.exports = { list, get, create, update, remove };
