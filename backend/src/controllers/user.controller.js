const User = require("../models/User");

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/me/onboarding
exports.updateOnboarding = async (req, res) => {
  try {
    const allowed = [
      "careerStage",
      "isStudent",
      "accountType",
      "academicPursuit",
      "institution",
      "course",
      "yearOfStudy",
      "apaarId",
      "transcriptUrl",
      "otpVerified",
      "completed",
    ];

    const updates = {};

    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") {
        updates[`onboarding.${key}`] = req.body[key];
      }
    }

    // ✅ Normalize isStudent if frontend sends "yes"/"no"/"skipped"
    if (typeof req.body.isStudent !== "undefined") {
      const v = req.body.isStudent;

      const isStu =
        v === true ||
        v === "yes" ||
        v === "skipped" ||
        v === "student";

      updates["onboarding.isStudent"] = isStu;
      updates["onboarding.accountType"] = isStu ? "student" : "professional";
    }

    // ✅ If accountType comes, sync isStudent
    if (typeof req.body.accountType !== "undefined") {
      const t = req.body.accountType;
      updates["onboarding.accountType"] = t;
      updates["onboarding.isStudent"] = t === "student";
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-passwordHash");

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};