const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // ✅ Email verification (signup)
    emailVerified: { type: Boolean, default: false },
    signupOtpHash: { type: String, default: "" },
    signupOtpExpiresAt: { type: Date, default: null },

    // reset otp verification for forgot password
    resetOtp: { type: String, default: "" },
    resetOtpExpiry: { type: Date, default: null },
    isOtpVerified: { type: Boolean, default: false },

    // ✅ NEW: College email OTP (student verification)
    eduOtpHash: { type: String, default: "" },
    eduOtpExpiresAt: { type: Date, default: null },

    onboarding: {
      careerStage: { type: String, default: "" },

      isStudent: { type: Boolean, default: false },
      accountType: {
        type: String,
        enum: ["student", "professional"],
        default: "professional",
      },

      academicPursuit: { type: String, default: "" },
      institution: { type: String, default: "" },
      course: { type: String, default: "" },
      yearOfStudy: { type: String, default: "" },
      apaarId: { type: String, default: "" },
      transcriptUrl: { type: String, default: "" },

      // ✅ NEW
      eduEmail: { type: String, default: "" },
      eduEmailVerified: { type: Boolean, default: false },

      otpVerified: { type: Boolean, default: false },
      completed: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
