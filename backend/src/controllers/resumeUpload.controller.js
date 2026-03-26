const { uploadResumePDF } = require("../config/cloudinary");
const cloudinary = require("cloudinary").v2; // ✅ ADD THIS
const Resume = require("../models/Resume");

exports.uploadResumePDFController = async (req, res) => {
  try {
    const file = req.file;
    const { cvNumber } = req.body;

    if (!file) {
      return res.status(400).json({
        message: "PDF file required"
      });
    }

    if (!cvNumber) {
      return res.status(400).json({
        message: "cvNumber required"
      });
    }

    const resume = await Resume.findOne({ cvNumber });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    // ====================================
    // 🔥 1. DELETE OLD PDF (if exists)
    // ====================================
    if (resume.pdfPublicId) {
      await cloudinary.uploader.destroy(resume.pdfPublicId);
    }

    // ====================================
    // 🔥 2. UPLOAD NEW PDF
    // ====================================
    const upload = await uploadResumePDF(file);

    // ====================================
    // 🔥 3. SAVE BOTH URL + PUBLIC ID
    // ====================================
    resume.pdfUrl = upload.secure_url;
    resume.pdfPublicId = upload.public_id; // ✅ IMPORTANT

    await resume.save();

    return res.json({
      message: "PDF uploaded successfully",
      pdfUrl: upload.secure_url
    });

  } catch (err) {
    console.error("Upload Resume PDF Error:", err);

    return res.status(500).json({
      message: "Upload failed"
    });
  }
};