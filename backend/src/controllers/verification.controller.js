const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/mailer");

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getUserIdFromAuth(req) {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

// POST /api/verification/send-edu-otp
exports.sendEduOtp = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const normalized = String(email).toLowerCase().trim();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    user.eduOtpHash = otpHash;
    user.eduOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ ensure onboarding exists
    user.onboarding = user.onboarding || {};
    user.onboarding.eduEmail = normalized;
    user.onboarding.eduEmailVerified = false;

    await user.save();

    await sendOtpEmail({ to: normalized, otp });

    return res.json({ message: "OTP sent to college email" });
  } catch (err) {
    console.error("sendEduOtp error:", err);
    return res.status(500).json({ message: err.message || "Failed to send OTP" });
  }
};

// POST /api/verification/verify-edu-otp
exports.verifyEduOtp = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.eduOtpHash || !user.eduOtpExpiresAt) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.eduOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const valid = await bcrypt.compare(String(otp).trim(), user.eduOtpHash);
    if (!valid) return res.status(400).json({ message: "Invalid OTP" });

    user.onboarding = user.onboarding || {};
    user.onboarding.eduEmailVerified = true;

    user.eduOtpHash = "";
    user.eduOtpExpiresAt = null;

    await user.save();

    return res.json({
      message: "Verified ✅ College email verified successfully",
      verified: true,
    });
  } catch (err) {
    console.error("verifyEduOtp error:", err);
    return res.status(500).json({ message: err.message || "OTP verify failed" });
  }
};