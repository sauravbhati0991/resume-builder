const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/avif",
    ];

    cb(
      allowed.includes(file.mimetype)
        ? null
        : new Error("Only image files allowed"),
      allowed.includes(file.mimetype)
    );
  },
});

module.exports = upload;