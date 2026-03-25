const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadBlogImage");

const {
  createBlog,
  listAllBlogs,
  updateBlog,
  toggleBlog,
  deleteBlog,
} = require("../controllers/admin.blog.controller");

router.get("/", adminAuth, listAllBlogs);
router.post("/", adminAuth, upload.single("image"), createBlog);

// ✅ EDIT: title/description + optional image
router.put("/:id", adminAuth, upload.single("image"), updateBlog);

router.patch("/:id/toggle", adminAuth, toggleBlog);
router.delete("/:id", adminAuth, deleteBlog);

module.exports = router;