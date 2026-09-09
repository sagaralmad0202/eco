const multer = require("multer");
const ApiError = require("../utils/ApiError");

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest("Only JPEG, PNG and WebP images are accepted"),
      false,
    );
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Export the configured single-file middleware.  Usage:
//   router.post("/me/avatar", authenticate, avatarUpload, controller.uploadAvatar);
module.exports = upload.single("avatar");
