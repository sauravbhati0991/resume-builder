const Blog = require("../models/Blog");

// landing page should show ONLY active blogs
exports.listActiveBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load blogs" });
  }
};