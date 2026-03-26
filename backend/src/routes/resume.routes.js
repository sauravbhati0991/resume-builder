const express = require("express");
const router = express.Router();

const userAuth = require("../middleware/userAuth.middleware");

const {
  createResume,
  getByCvNumber,
  listMyResumes,
  deleteResume,
  viewResumePDF,
  downloadResumePDF
} = require("../controllers/resume.controller");


// ======================================================
// POST /api/resumes
// Create new resume OR update existing resume
// Generates CV number if new
// ======================================================
router.post("/", userAuth, createResume);


// ======================================================
// GET /api/resumes/me
// Get all resumes created by the logged-in user
// Used in dashboard resume history
// ======================================================
router.get("/me", userAuth, listMyResumes);


// ======================================================
// GET /api/resumes/cv/:cvNumber
// Fetch resume using CV number
// Used in Resume Viewer page
// ======================================================
router.get("/cv/:cvNumber", getByCvNumber);


// ======================================================
// GET /api/resumes/view/:cvNumber
// Open resume PDF through backend
// ======================================================
router.get("/view/:cvNumber", viewResumePDF);


// ======================================================
// GET /api/resumes/download/:cvNumber
// Force download resume PDF
// ======================================================
router.get("/download/:cvNumber", downloadResumePDF);


// ======================================================
// DELETE /api/resumes/:resumeId
// Delete a specific resume from user's history
// ======================================================
router.delete("/:resumeId", userAuth, deleteResume);


module.exports = router;