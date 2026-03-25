const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryBySlug, // ✅ NEW
  getAllCategoriesAdmin,
  updateCategory,
  toggleCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const adminAuth = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Create category
router.post("/", adminAuth, createCategory);

// Get ALL categories (active + inactive)
router.get("/admin/all", adminAuth, getAllCategoriesAdmin);

// Update category (name / colors)
router.put("/:id", adminAuth, updateCategory);

// Toggle visibility (show / hide for users)
router.patch("/:id/toggle", adminAuth, toggleCategory);

// HARD delete (permanent)
router.delete("/:id", adminAuth, deleteCategory);

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

// ✅ Get category by slug (for templates category page)
router.get("/slug/:slug", getCategoryBySlug);

// Get only ACTIVE categories (for templates page)
router.get("/", getCategories);

module.exports = router;