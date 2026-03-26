const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true
    },

    templateName: {
      type: String,
      default: "",
      trim: true
    },

    pdfPublicId: {
      type: String,
      default: ""
    },

    categoryName: {
      type: String,
      default: "",
      trim: true
    },

    cvNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    // Stores edited resume JSON data
    resumeData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Cloudinary PDF URL
    pdfUrl: {
      type: String,
      default: ""
    }

  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model("Resume", resumeSchema);