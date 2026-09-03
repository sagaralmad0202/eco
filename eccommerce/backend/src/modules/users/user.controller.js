const asyncHandler = require("../../utils/asyncHandler");
const userService = require("./user.service");

// req.user is attached by authenticate, so the id is never read from the URL or
// the body. A /users/:id/profile route would need an ownership check on every
// call and would be one forgotten check away from letting any customer read
// another's profile; "me" makes that mistake impossible to write.
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ success: true, data: { user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  // The updated user comes back in the response so the client can refresh what
  // it displays from the saved row rather than from its own form state. Those
  // differ whenever the server normalises a value — a phone number typed as
  // "003 888 232" is stored as digits, and echoing the form back would show the
  // customer something the database does not contain.
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    const ApiError = require("../../utils/ApiError");
    throw ApiError.badRequest("No image file was uploaded");
  }

  // Store the path relative to the /media static mount so publicMediaUrl()
  // can resolve it the same way it resolves product images.
  const avatarPath = `/media/avatars/${req.file.filename}`;
  const user = await userService.updateAvatar(req.user.id, avatarPath);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

module.exports = { getProfile, updateProfile, uploadAvatar };
