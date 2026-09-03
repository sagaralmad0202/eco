const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.resolve(__dirname, "../../public/uploads");

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        "Only image files (JPEG, PNG, WebP, GIF, SVG) are accepted",
      ),
      false,
    );
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Accepts a single file from fields named 'file', 'image', or 'avatar'
module.exports = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
]);
