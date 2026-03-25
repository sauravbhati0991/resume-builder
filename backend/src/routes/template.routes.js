const express = require("express");
const {
  createTemplate,
  getTemplates,
  getAllTemplatesAdmin,
  updateTemplate,
  toggleTemplate,
  deleteTemplate,
  getTemplateBySlug,
  getTemplateById, 
} = require("../controllers/template.controller");

const adminAuth = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */
router.post("/", adminAuth, createTemplate);
router.get("/admin/all", adminAuth, getAllTemplatesAdmin);
router.put("/:id", adminAuth, updateTemplate);
router.patch("/:id/toggle", adminAuth, toggleTemplate);
router.delete("/:id", adminAuth, deleteTemplate);

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */
router.get("/slug/:slug", getTemplateBySlug);
router.get("/", getTemplates);
router.get("/:id", getTemplateById);

module.exports = router;