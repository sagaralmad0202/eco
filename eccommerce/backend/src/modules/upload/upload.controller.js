const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const publicMediaUrl = require("../../utils/publicMediaUrl");
const prisma = require("../../lib/prisma");

const uploadFile = asyncHandler(async (req, res) => {
  // Find uploaded file from fields or single
  const uploaded =
    req.files?.file?.[0] ||
    req.files?.image?.[0] ||
    req.files?.avatar?.[0] ||
    req.file;

  if (!uploaded) {
    throw ApiError.badRequest("No file was uploaded. Provide a file in 'file', 'image', or 'avatar' field.");
  }

  const relativePath = `/media/uploads/${uploaded.filename}`;
  const fullUrl = publicMediaUrl(relativePath);

  // If authenticated and requested as avatar, update the user avatar automatically
  if (req.user?.id && (req.query?.type === "avatar" || req.body?.type === "avatar")) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: relativePath },
    });
  }

  const isAvatar = req.query?.type === "avatar" || req.body?.type === "avatar";

  res.status(201).json({
    success: true,
    message: isAvatar ? "Profile updated successfully" : "File uploaded successfully",
    data: {
      url: relativePath,
      publicUrl: fullUrl,
      filename: uploaded.filename,
      originalName: uploaded.originalname,
      mimetype: uploaded.mimetype,
      size: uploaded.size,
    },
  });
});

module.exports = { uploadFile };
