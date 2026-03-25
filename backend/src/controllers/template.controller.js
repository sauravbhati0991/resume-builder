const Template = require("../models/Template");
const Category = require("../models/Category");

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * =========================
 * ADMIN CONTROLLERS
 * =========================
 */

// CREATE template
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      roles,
      previewImage,
      html,
      css,
      primaryColor,
      accentColor,
      isPaid,
      price,
      adminNotes,
    } = req.body;

    if (!name || !category || !previewImage) {
      return res.status(400).json({
        message: "name, category, previewImage are required",
      });
    }

    // ✅ require real template content (recommended)
    if (!html || !css) {
      return res
        .status(400)
        .json({ message: "html and css are required for a template" });
    }

    // ✅ validate category
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const finalSlug = slug ? slugify(slug) : slugify(`${name}-${cat.slug}`);

    const exists = await Template.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ message: "Template slug already exists" });
    }

    const template = await Template.create({
      name: name.trim(),
      slug: finalSlug,
      category,
      roles: Array.isArray(roles) ? roles : [],
      previewImage,

      html,
      css,

      // ✅ auto-apply category theme if not passed
      primaryColor: primaryColor || cat.primaryColor,
      accentColor: accentColor || cat.accentColor,

      isPaid: Boolean(isPaid),
      price: Boolean(isPaid) ? Number(price || 0) : 0,
      adminNotes: adminNotes || "",
    });

    res.status(201).json(template);
  } catch (err) {
    // ✅ handle Mongo duplicate key cleanly
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Slug already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET ALL templates (admin – active + inactive)
// ✅ supports: /templates/admin/all?category=<categoryId>
exports.getAllTemplatesAdmin = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const templates = await Template.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE TEMPLATE (Crucial for changing Free/Paid status)
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, previewImage, isPaid, price, isActive } = req.body;

    // Logic: If 'isPaid' is false (Free), force price to 0.
    // We parse 'isPaid' because sometimes it comes as a string "true"/"false" from forms
    const isPaidBoolean = isPaid === true || isPaid === 'true';
    const finalPrice = isPaidBoolean ? Number(price) : 0;

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        name,
        previewImage,
        isPaid: isPaidBoolean,
        price: finalPrice,
        isActive: isActive // Admin can show/hide template
      },
      { new: true } // Return the updated document
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update template" });
  }
};

// TOGGLE template visibility
exports.toggleTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE template (soft)
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.isActive = false;
    await template.save();

    res.json({ message: "Template disabled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * =========================
 * PUBLIC CONTROLLERS
 * =========================
 */

// ✅ GET ACTIVE templates (supports category filter)
// /templates?category=<categoryId>
exports.getTemplates = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const templates = await Template.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE TEMPLATE BY SLUG (needed for "Use Template")
// /templates/slug/:slug
exports.getTemplateBySlug = async (req, res) => {
  try {
    const template = await Template.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category");

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).populate("category");
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};