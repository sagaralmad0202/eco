const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const publicMediaUrl = require("../../utils/publicMediaUrl");
const { uploadObject } = require("../../lib/storage");
const env = require("../../config/env");
const prisma = require("../../lib/prisma");

const uploadFile = asyncHandler(async (req, res) => {
  // Find uploaded file from fields or single
  const uploaded =
    req.files?.file?.[0] ||
    req.files?.image?.[0] ||
    req.files?.avatar?.[0] ||
    req.file;

  if (!uploaded) {
    throw ApiError.badRequest(
      "No file was uploaded. Provide a file in 'file', 'image', or 'avatar' field.",
    );
  }

  const ext = path.extname(uploaded.originalname).toLowerCase() || ".jpg";
  const prefix = req.user?.id ? `${req.user.id}-` : "";
  const filename = `${prefix}${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const objectKey = `uploads/${filename}`;

  let finalUrl;
  let relativePath = `/media/uploads/${filename}`;

  // If Object Storage credentials exist, upload directly to bucket
  if (env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY) {
    const uploadRes = await uploadObject({
      key: objectKey,
      body: uploaded.buffer,
      contentType: uploaded.mimetype,
      isPublic: true,
    });
    finalUrl = uploadRes.url;
    relativePath = uploadRes.url;
  } else {
    // Local fallback for offline dev environment
    const uploadDir = path.resolve(__dirname, "../../../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), uploaded.buffer);
    finalUrl = publicMediaUrl(relativePath);
  }

  // If authenticated and requested as avatar, update user avatar URL
  const isAvatar = req.query?.type === "avatar" || req.body?.type === "avatar";
  if (req.user?.id && isAvatar) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: finalUrl },
    });
  }

  res.status(201).json({
    success: true,
    message: isAvatar
      ? "Profile updated successfully"
      : "File uploaded successfully",
    data: {
      url: finalUrl,
      publicUrl: finalUrl,
      filename,
      originalName: uploaded.originalname,
      mimetype: uploaded.mimetype,
      size: uploaded.size,
    },
  });
});

module.exports = { uploadFile };
