const Resume = require("../models/Resume");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;


// ============================================
// Generate readable CV number like: CV-8H2K-41P9
// ============================================
function generateCvNumber() {

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const pick = (n) =>
    Array.from({ length: n }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `CV-${pick(4)}-${pick(4)}`;
}



// ============================================
// POST /api/resumes
// Create OR update resume
// ============================================
exports.createResume = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const {
      templateId,
      templateName,
      categoryName,
      resumeData,
      cvNumber,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!templateId) {
      return res.status(400).json({
        message: "templateId is required"
      });
    }

    if (cvNumber) {
      const existing = await Resume.findOne({ cvNumber, userId });

      if (existing) {
        existing.templateId = templateId;
        existing.templateName = templateName;
        existing.categoryName = categoryName;
        existing.resumeData = resumeData;

        await existing.save();

        return res.json({
          message: "Resume updated",
          cvNumber: existing.cvNumber,
          resumeId: existing._id
        });
      }
    }


    let newCvNumber;
    let exists = true;

    while (exists) {
      newCvNumber = generateCvNumber();
      exists = await Resume.exists({ cvNumber: newCvNumber });
    }

    const resume = await Resume.create({
      userId,
      templateId,
      templateName,
      categoryName,
      resumeData,
      cvNumber: newCvNumber
    });

    return res.status(201).json({
      message: "Resume created successfully",
      cvNumber: newCvNumber,
      resumeId: resume._id
    });

  } catch (err) {
    console.error("Create Resume Error:", err);

    return res.status(500).json({
      message: "Failed to create resume"
    });
  }
};



// ============================================
// GET /api/resumes/cv/:cvNumber
// Fetch resume by CV number
// ============================================
exports.getByCvNumber = async (req, res) => {

  try {

    const cvNumber = String(req.params.cvNumber || "").trim();

    if (!cvNumber) {
      return res.status(400).json({
        message: "cvNumber is required"
      });
    }


    const doc = await Resume.findOne({ cvNumber }).lean();


    if (!doc) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }


    return res.json({

      cvNumber: doc.cvNumber,
      templateId: doc.templateId,
      templateName: doc.templateName,
      categoryName: doc.categoryName,
      resumeData: doc.resumeData,
      pdfUrl: doc.pdfUrl || "",
      createdAt: doc.createdAt

    });

  } catch (err) {

    console.error("getByCvNumber Error:", err);

    return res.status(500).json({
      message: "Failed to fetch resume"
    });

  }

};



// ============================================
// GET /api/resumes/me
// Get resumes for logged-in user
// ============================================
exports.listMyResumes = async (req, res) => {

  try {

    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }


    const resumes = await Resume.find({ userId })
      .select("cvNumber templateId templateName categoryName createdAt pdfUrl")
      .sort({ createdAt: -1 })
      .lean();


    return res.json(resumes);

  } catch (err) {

    console.error("listMyResumes Error:", err);

    return res.status(500).json({
      message: "Failed to fetch resumes"
    });

  }

};



// ============================================
// DELETE /api/resumes/:resumeId
// Delete resume
// ============================================
exports.deleteResume = async (req, res) => {

  try {

    const userId = req.userId || req.user?._id;
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }


    const resume = await Resume.findOne({
      _id: resumeId,
      userId
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    if (resume.pdfPublicId) {
      const result = await cloudinary.uploader.destroy(resume.pdfPublicId);

    }
    await Resume.deleteOne({ _id: resumeId });

    return res.json({
      message: "Resume deleted successfully"
    });

  } catch (err) {

    console.error("deleteResume Error:", err);

    return res.status(500).json({
      message: "Failed to delete resume"
    });

  }

};
// ============================================
// GET /api/resumes/view/:cvNumber
// Open resume PDF through backend
// ============================================
exports.viewResumePDF = async (req, res) => {

  try {

    const { cvNumber } = req.params;

    const resume = await Resume.findOne({ cvNumber });

    if (!resume || !resume.pdfUrl) {
      return res.status(404).json({
        message: "Resume PDF not found"
      });
    }

    console.log("Opening PDF URL:", resume.pdfUrl);

    const response = await axios.get(resume.pdfUrl, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    return res.send(response.data);

  } catch (err) {

    console.error("viewResumePDF Error:");
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);

    return res.status(500).json({
      message: "Failed to open PDF"
    });

  }

};