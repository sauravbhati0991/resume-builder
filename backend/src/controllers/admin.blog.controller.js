const Blog = require("../models/Blog");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// ✅ CREATE
exports.createBlog = async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();

    if (!title || !description || !req.file) {
      return res.status(400).json({ message: "Title, description & image required" });
    }

    const upload = await uploadToCloudinary(req.file);

    const blog = await Blog.create({
      title,
      description,
      imageUrl: upload.secure_url,
      imagePublicId: upload.public_id,
      isActive: true,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("createBlog:", err);
    res.status(500).json({ message: "Blog creation failed", error: err.message });
  }
};

// ✅ LIST (ADMIN)
exports.listAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load blogs" });
  }
};

// ✅ UPDATE (EDIT title/description + optionally image)
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const title = req.body?.title != null ? String(req.body.title).trim() : null;
    const description =
      req.body?.description != null ? String(req.body.description).trim() : null;

    if (title !== null) blog.title = title;
    if (description !== null) blog.description = description;

    // ✅ optional new image replacement
    if (req.file) {
      // delete old image from cloudinary
      if (blog.imagePublicId) {
        await deleteFromCloudinary(blog.imagePublicId);
      }

      const upload = await uploadToCloudinary(req.file);
      blog.imageUrl = upload.secure_url;
      blog.imagePublicId = upload.public_id;
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error("updateBlog:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ TOGGLE
exports.toggleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isActive = !blog.isActive;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Toggle failed" });
  }
};

// ✅ DELETE
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.imagePublicId) await deleteFromCloudinary(blog.imagePublicId);
    await blog.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};