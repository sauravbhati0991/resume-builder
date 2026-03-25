const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Display name
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // URL safe slug
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true, // ✅ faster lookup by slug
    },

    // UI theme
    primaryColor: {
      type: String,
      required: true,
    },

    accentColor: {
      type: String,
      required: true,
    },

    // Serial number / display order
    order: {
      type: Number,
      default: 1, // ✅ better default
      index: true, // ✅ sorting optimization
    },

    // Visibility toggle
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ prevent duplicate slugs at DB level
categorySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);