const { uploadResumePDF } = require("../config/cloudinary");
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

    // Upload PDF to Cloudinary
    const upload = await uploadResumePDF(file);
    const pdfUrl = upload.secure_url;

    // Save PDF URL in DB
    resume.pdfUrl = pdfUrl;
    await resume.save();

    return res.json({
      message: "PDF uploaded successfully",
      pdfUrl
    });

  } catch (err) {
    console.error("Upload Resume PDF Error:", err);

    return res.status(500).json({
      message: "Upload failed"
    });
  }
};