// backend/src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/mailer");

/* ===================== JWT ===================== */
function signUserToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: "USER" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

/* ===================== OTP ===================== */
function makeOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function deliverOtp({ to, otp }) {
  // ✅ REAL EMAIL OTP
  await sendOtpEmail({ to, otp });
}

/* ===================== SIGNUP ===================== */
/**
 * POST /api/auth/signup
 * ✅ Create user (emailVerified=false) + send OTP
 * ✅ No token until OTP verified
 */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email, password are required" });
    }

    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    });

    // ✅ generate signup OTP and store hash+expiry
    const otp = makeOtp6();
    const otpHash = await bcrypt.hash(otp, 10);

    user.signupOtpHash = otpHash;
    user.signupOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await deliverOtp({ to: user.email, otp });

    return res.status(201).json({
      requiresOtp: true,
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({
      message: err?.message || "Signup failed",
    });
  }
};

/**
 * POST /api/auth/signup/verify-otp
 * ✅ Verify signup OTP -> emailVerified=true -> return token
 */
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      const token = signUserToken(user);
      const safeUser = await User.findById(user._id).select("-passwordHash");
      return res.json({
        token,
        user: safeUser,
        message: "Email already verified",
      });
    }

    if (!user.signupOtpHash || !user.signupOtpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP not requested. Please signup again." });
    }

    if (user.signupOtpExpiresAt.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please resend OTP." });
    }

    const ok = await bcrypt.compare(String(otp).trim(), user.signupOtpHash);
    if (!ok) return res.status(401).json({ message: "Invalid OTP" });

    // ✅ mark verified + clear otp fields
    user.emailVerified = true;
    user.signupOtpHash = "";
    user.signupOtpExpiresAt = null;
    user.onboarding.otpVerified = true;
    await user.save();

    const token = signUserToken(user);
    const safeUser = await User.findById(user._id).select("-passwordHash");

    return res.json({ token, user: safeUser, message: "Email verified" });
  } catch (err) {
    console.error("verifySignupOtp error:", err);
    return res
      .status(500)
      .json({ message: err?.message || "OTP verify failed" });
  }
};

/**
 * POST /api/auth/signup/resend-otp
 * ✅ Resend signup OTP if not verified
 */
exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified)
      return res.json({ message: "Email already verified" });

    const otp = makeOtp6();
    const otpHash = await bcrypt.hash(otp, 10);

    user.signupOtpHash = otpHash;
    user.signupOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await deliverOtp({ to: user.email, otp });

    return res.json({ message: "OTP resent to email" });
  } catch (err) {
    console.error("resendSignupOtp error:", err);
    return res
      .status(500)
      .json({ message: err?.message || "Failed to resend OTP" });
  }
};

/* ===================== LOGIN ===================== */
/**
 * POST /api/auth/login
 * ✅ Normal login (NO OTP)
 * ✅ Block if email not verified
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email to login.",
        requiresEmailVerification: true,
      });
    }

    const token = signUserToken(user);
    const safeUser = await User.findById(user._id).select("-passwordHash");

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: err?.message || "Login failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail({ to: email, otp });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyFPOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      String(user.resetOtp) !== String(otp).trim() ||
      user.resetOtpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.isOtpVerified = true;
    await user.save();

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
};
