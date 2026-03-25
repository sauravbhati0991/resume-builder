const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");

const {
  uploadResumePDFController
} = require("../controllers/resumeUpload.controller");

router.post(
  "/resume-pdf",
  upload.single("file"),
  uploadResumePDFController
);

module.exports = router;