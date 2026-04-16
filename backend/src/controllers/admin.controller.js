const Admin = require("../models/Admin");
const User = require("../models/User"); // Ensure you import User
const Template = require("../models/Template"); // Ensure you import Template
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ONE TIME REGISTER
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Admin created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DASHBOARD STATS (Fixed)
exports.getDashboardStats = async (req, res) => {
  try {
    // 1) Total Users (count all)
    const totalUsers = await User.countDocuments({});

    // 2) Students (support multiple possible fields)
    const studentCount = await User.countDocuments({
      $or: [
        { "onboarding.accountType": "student" },
        { accountType: "student" },
        { "onboarding.isStudent": true },
        { careerStage: "Student" }, // fallback if you used this earlier
      ],
    });

    // 3) Professionals (support multiple possible fields)
    const professionalCount = await User.countDocuments({
      $or: [
        { "onboarding.accountType": "professional" },
        { accountType: "professional" },
        { "onboarding.isStudent": false },
      ],
    });

    // 4) Total Templates
    const totalTemplates = await Template.countDocuments({});
    const paidTemplates = await Template.countDocuments({ isPaid: true });
    const freeTemplates = await Template.countDocuments({ isPaid: false });

    // 5) Revenue (placeholder)
    const revenue = "₹0";

    res.json({
      totalUsers,
      userStats: {
        students: studentCount,
        professionals: professionalCount,
      },
      templateStats: {
        total: totalTemplates,
        paid: paidTemplates,
        free: freeTemplates,
      },
      revenue,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// ✅ GET USERS LIST
exports.getUsersList = async (req, res) => {
  try {
    const users = await User.find({}, "fullName email onboarding.accountType onboarding.apaarId onboarding.verificationStatus onboarding.subscriptionExpiry onboarding.verifiedName onboarding.verifiedInstitution onboarding.verifiedCourse onboarding.verifiedDob onboarding.verifiedGender onboarding.verifiedDigilockerId createdAt").sort({ createdAt: -1 });

    const formattedUsers = users.map(u => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      accountType: u.onboarding?.accountType || "professional",
      apaarId: u.onboarding?.apaarId || "N/A",
      verificationStatus: u.onboarding?.verificationStatus || "N/A",
      subscriptionExpiry: u.onboarding?.subscriptionExpiry,
      verifiedName: u.onboarding?.verifiedName,
      verifiedInstitution: u.onboarding?.verifiedInstitution,
      verifiedCourse: u.onboarding?.verifiedCourse,
      verifiedDob: u.onboarding?.verifiedDob,
      verifiedGender: u.onboarding?.verifiedGender,
      verifiedDigilockerId: u.onboarding?.verifiedDigilockerId,
      createdAt: u.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Users List Error:", error);
    res.status(500).json({ message: "Failed to fetch user list" });
  }
};