const Category = require("../models/Category");
const Template = require("../models/Template");

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ✅ helper: re-number order 1..n
async function reorderCategories() {
  const remaining = await Category.find().sort({ order: 1, createdAt: 1 });

  for (let i = 0; i < remaining.length; i++) {
    const desiredOrder = i + 1;
    if ((remaining[i].order || 0) !== desiredOrder) {
      remaining[i].order = desiredOrder;
      await remaining[i].save();
    }
  }
}

/**
 * =========================
 * ADMIN CONTROLLERS
 * =========================
 */

// ✅ CREATE category (auto assigns order)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, primaryColor, accentColor } = req.body;

    if (!name || !primaryColor || !accentColor) {
      return res
        .status(400)
        .json({ message: "name, primaryColor, accentColor are required" });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    // ensure unique slug
    const exists = await Category.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    // auto order = last + 1
    const last = await Category.findOne().sort({ order: -1 });
    const nextOrder = last?.order ? last.order + 1 : 1;

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      primaryColor,
      accentColor,
      order: nextOrder,
      isActive: true,
    });

    return res.status(201).json(category);
  } catch (err) {
    // duplicate key clean handling
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL categories (admin) - active + inactive
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE category (name/colors/slug/order/isActive)
exports.updateCategory = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.slug) payload.slug = slugify(payload.slug);
    if (payload.name && !payload.slug) payload.slug = slugify(payload.name);

    // prevent slug collision
    if (payload.slug) {
      const exists = await Category.findOne({
        slug: payload.slug,
        _id: { $ne: req.params.id },
      });
      if (exists) {
        return res.status(400).json({ message: "Category slug already exists" });
      }
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    // if order changed, normalize ordering
    await reorderCategories();

    return res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ✅ TOGGLE category visibility (and sync templates)
exports.toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    // if category hidden → hide all templates under it
    if (!category.isActive) {
      await Template.updateMany({ category: category._id }, { isActive: false });
    }

    return res.json(category);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ HARD DELETE category (permanent) + delete its templates + reorder
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 1) delete templates under category
    await Template.deleteMany({ category: category._id });

    // 2) delete category
    await Category.deleteOne({ _id: category._id });

    // 3) reorder remaining categories (1..n)
    await reorderCategories();

    return res.json({ message: "Category deleted permanently" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * =========================
 * PUBLIC CONTROLLERS
 * =========================
 */

// ✅ GET ACTIVE categories only
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE CATEGORY BY SLUG (public)
// /categories/slug/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};