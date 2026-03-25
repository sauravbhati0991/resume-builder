const express = require("express");
const {
  sendEduOtp,
  verifyEduOtp,
} = require("../controllers/verification.controller");

const router = express.Router();

router.post("/send-edu-otp", sendEduOtp);
router.post("/verify-edu-otp", verifyEduOtp);

module.exports = router;