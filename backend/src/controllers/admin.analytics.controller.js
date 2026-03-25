const User = require("../models/User");
const Template = require("../models/Template");

exports.getDashboardStats = async (req, res) => {
  try {
    // ✅ total users (exclude admins if they are in different collection already)
    const totalUsers = await User.countDocuments({});

    // ✅ student/professional based on onboarding.accountType (YOUR CURRENT FLOW)
    const students = await User.countDocuments({ "onboarding.accountType": "student" });
    const professionals = await User.countDocuments({ "onboarding.accountType": "professional" });

    // ✅ fallback (if old users don’t have onboarding yet)
    // (optional) you can add these into students/professionals if you want:
    // const oldStudents = await User.countDocuments({ careerStage: "Student" });

    const totalTemplates = await Template.countDocuments({});
    const paidTemplates = await Template.countDocuments({ isPaid: true });
    const freeTemplates = await Template.countDocuments({ isPaid: false });

    res.json({
      totalUsers,
      userStats: { students, professionals },
      templateStats: { total: totalTemplates, paid: paidTemplates, free: freeTemplates },
      revenue: "₹0", // later: compute from payment/transactions collection
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};