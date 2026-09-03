const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Avatars land in backend/public/avatars/ and are served by the /media static
// mount in app.js as /media/avatars/<filename>.  The same publicMediaUrl()
// helper that already resolves product images turns the stored relative path
// into an absolute URL for the client.

const UPLOAD_DIR = path.resolve(__dirname, "../../public/avatars");

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },

  // userId-timestamp-random.ext — unique by construction, so two uploads from
  // the same user a millisecond apart still cannot collide.
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${req.user.id}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    cb(null, name);
  },
});

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
