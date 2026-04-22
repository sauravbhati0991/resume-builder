const express = require("express");
const {
  sendEduOtp,
  verifyEduOtp,
} = require("../controllers/verification.controller");
const {
  getDigilockerAuthUrl,
} = require("../controllers/idVerification.controller");
const userAuth = require("../middleware/userAuth.middleware");

const router = express.Router();

router.post("/send-edu-otp", sendEduOtp);
router.post("/verify-edu-otp", verifyEduOtp);

// DigiLocker OAuth Route
router.get("/apaar/auth-url", userAuth, getDigilockerAuthUrl);

module.exports = router;