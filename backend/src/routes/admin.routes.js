const express = require("express");
const { loginAdmin, registerAdmin, getDashboardStats } = require("../controllers/admin.controller");
const adminAuth = require("../middleware/auth.middleware"); // Assuming this is your admin middleware

const router = express.Router();

router.post("/signup", registerAdmin); // Ideally protect this or disable after 1st admin
router.post("/login", loginAdmin);

// ✅ Add Stats Route
router.get("/stats", adminAuth, getDashboardStats);

module.exports = router;