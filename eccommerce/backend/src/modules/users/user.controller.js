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

  const path = require("path");
  const fs = require("fs");
  const crypto = require("crypto");
  const { uploadObject } = require("../../lib/storage");
  const env = require("../../config/env");
  const publicMediaUrl = require("../../utils/publicMediaUrl");

  const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const filename = `${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const objectKey = `avatars/${filename}`;

  let avatarUrl;
  if (env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY) {
    const uploadRes = await uploadObject({
      key: objectKey,
      body: req.file.buffer,
      contentType: req.file.mimetype,
      isPublic: true,
    });
    avatarUrl = uploadRes.url;
  } else {
    const localDir = path.resolve(__dirname, "../../../public/avatars");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(path.join(localDir, filename), req.file.buffer);
    avatarUrl = publicMediaUrl(`/media/avatars/${filename}`);
  }

  const user = await userService.updateAvatar(req.user.id, avatarUrl);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

module.exports = { getProfile, updateProfile, uploadAvatar };
