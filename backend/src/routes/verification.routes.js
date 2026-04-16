const express = require("express");
const {
  sendEduOtp,
  verifyEduOtp,
} = require("../controllers/verification.controller");
const {
  verifyApaar,
  getDigilockerAuthUrl,
  verifyApaarCode
} = require("../controllers/idVerification.controller");
const userAuth = require("../middleware/userAuth.middleware");

const router = express.Router();

router.post("/send-edu-otp", sendEduOtp);
router.post("/verify-edu-otp", verifyEduOtp);

// router.post("/verify-apaar", userAuth, verifyApaar);

// New DigiLocker OAuth Routes
router.get("/apaar/auth-url", userAuth, getDigilockerAuthUrl);
// router.post("/apaar/verify-code", userAuth, verifyApaarCode);

module.exports = router;