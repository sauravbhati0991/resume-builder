const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-safe name for frontend routing
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    // Category reference
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Roles supported by this template
    roles: {
      type: [String],
      required: true,
      default: [],
    },

    // Preview image URL
    previewImage: {
      type: String,
      required: true,
    },

    // ✅ THE REAL TEMPLATE CONTENT (for editor)
    html: {
      type: String,
      required: true,
      default: "",
    },

    css: {
      type: String,
      required: true,
      default: "",
    },

    // ✅ Template theme colors (saved per template)
    primaryColor: {
      type: String,
      required: true,
    },

    accentColor: {
      type: String,
      required: true,
    },

    // Pricing
    isPaid: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      default: 0,
    },

    // Visibility
    isActive: {
      type: Boolean,
      default: true,
    },

    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);