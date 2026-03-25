const express = require("express");
const {
  signup,
  login,
  verifySignupOtp,
  resendSignupOtp,
  forgotPassword,
  verifyFPOtp,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/signup/resend-otp", resendSignupOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyFPOtp);
router.post("/reset-password", resetPassword);

router.post("/login", login);

module.exports = router;
