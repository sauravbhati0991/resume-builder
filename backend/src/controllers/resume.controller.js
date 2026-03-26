const Resume = require("../models/Resume");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const logFile = path.join(__dirname, "../../debug_urls.log");
const { deleteResumePDF } = require("../config/cloudinary");


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
      resumeData
    } = req.body;


    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!templateId) {
      return res.status(400).json({
        message: "templateId is required"
      });
    }


    // ============================================
    // Check if resume already exists
    // ============================================
    let existingResume = await Resume.findOne({ userId, templateId });


    if (existingResume) {

      existingResume.resumeData =
        resumeData || existingResume.resumeData;

      if (templateName) existingResume.templateName = templateName;
      if (categoryName) existingResume.categoryName = categoryName;

      await existingResume.save();

      return res.json({
        message: "Resume updated successfully",
        cvNumber: existingResume.cvNumber,
        resumeId: existingResume._id
      });

    }


    // ============================================
    // Generate unique CV number
    // ============================================
    let cvNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 5) {

      cvNumber = generateCvNumber();

      exists = await Resume.exists({ cvNumber });

      attempts++;

    }

    if (exists) {
      return res.status(500).json({
        message: "Failed to generate unique CV number"
      });
    }


    // ============================================
    // Create resume
    // ============================================
    const resume = await Resume.create({

      userId,
      templateId,
      templateName,
      categoryName,
      resumeData,
      cvNumber

    });


    return res.status(201).json({

      message: "Resume created successfully",
      cvNumber,
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
      .select("cvNumber templateId templateName categoryName resumeData createdAt pdfUrl")
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


    // Delete PDF from Cloudinary if it exists
    if (resume.cvNumber) {
      try {
        await deleteResumePDF(resume.cvNumber);
      } catch (err) {
        console.error("Cloudinary deletion failed:", err.message);
        // We continue anyway so the DB record is removed even if Cloudinary fails
      }
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

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    const patterns = [
      resume.pdfUrl,
      // IMAGE patterns (new standard)
      `https://res.cloudinary.com/${cloudName}/image/upload/resumea/resumes/${cvNumber}.pdf`,
      `https://res.cloudinary.com/${cloudName}/image/upload/resumea/resumes/${cvNumber}`,
      // RAW patterns (legacy)
      `https://res.cloudinary.com/${cloudName}/raw/upload/resumea/resumes/${cvNumber}`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/resumea/resumes/${cvNumber}.pdf`,
      // With v1 fallback
      `https://res.cloudinary.com/${cloudName}/image/upload/v1/resumea/resumes/${cvNumber}.pdf`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/v1/resumea/resumes/${cvNumber}.pdf`
    ].filter(Boolean);

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] CV: ${cvNumber} Patterns: ${JSON.stringify(patterns)}\n`);
    console.log(`[viewResumePDF] Attempting to open ${cvNumber} from ${patterns.length} potential URLs...`);

    let lastError = null;
    for (const pdfUrl of patterns) {
      try {
        console.log(`[viewResumePDF] Trying: ${pdfUrl}`);
        const response = await axios.get(pdfUrl, { responseType: "arraybuffer", timeout: 5000 });
        
        console.log(`[viewResumePDF] Success fetching from: ${pdfUrl}`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        return res.send(response.data);
      } catch (err) {
        console.warn(`[viewResumePDF] Failed to fetch from ${pdfUrl}:`, err.message);
        lastError = err;
      }
    }

    console.error(`[viewResumePDF] All patterns failed for ${cvNumber}`);
    return res.status(lastError?.response?.status || 404).json({
      message: "Resume PDF could not be opened. Please check Cloudinary.",
      error: lastError?.message
    });

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

// ============================================
// GET /api/resumes/download/:cvNumber
// Force download resume PDF
// ============================================
exports.downloadResumePDF = async (req, res) => {
  try {
    const { cvNumber } = req.params;
    const resume = await Resume.findOne({ cvNumber });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    const patterns = [
      resume.pdfUrl,
      // IMAGE patterns (new standard)
      `https://res.cloudinary.com/${cloudName}/image/upload/resumea/resumes/${cvNumber}.pdf`,
      `https://res.cloudinary.com/${cloudName}/image/upload/resumea/resumes/${cvNumber}`,
      // RAW patterns (legacy)
      `https://res.cloudinary.com/${cloudName}/raw/upload/resumea/resumes/${cvNumber}`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/resumea/resumes/${cvNumber}.pdf`,
      // With v1 fallback
      `https://res.cloudinary.com/${cloudName}/image/upload/v1/resumea/resumes/${cvNumber}.pdf`,
      `https://res.cloudinary.com/${cloudName}/raw/upload/v1/resumea/resumes/${cvNumber}.pdf`
    ].filter(Boolean);

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] DOWNLOAD_CV: ${cvNumber} Patterns: ${JSON.stringify(patterns)}\n`);
    console.log(`[downloadResumePDF] Attempting to fetch ${cvNumber} from ${patterns.length} potential URLs...`);

    let lastError = null;
    for (const pdfUrl of patterns) {
      try {
        console.log(`[downloadResumePDF] Trying: ${pdfUrl}`);
        const response = await axios.get(pdfUrl, { responseType: "arraybuffer", timeout: 5000 });
        
        console.log(`[downloadResumePDF] Success fetching from: ${pdfUrl}`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${cvNumber}.pdf"`);
        return res.send(response.data);
      } catch (err) {
        console.warn(`[downloadResumePDF] Failed to fetch from ${pdfUrl}:`, err.message);
        lastError = err;
      }
    }

    // If all patterns fail
    console.error(`[downloadResumePDF] All ${patterns.length} download patterns failed for ${cvNumber}`);
    return res.status(lastError?.response?.status || 404).json({
      message: "Resume PDF not found in storage. Please re-save in the builder.",
      error: lastError?.message
    });
  } catch (err) {
    console.error("downloadResumePDF Error:", err.message);
    return res.status(500).json({
      message: "Failed to download PDF"
    });
  }
};