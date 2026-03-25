const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/auth.middleware"); // must be admin-auth middleware
const { getDashboardStats } = require("../controllers/admin.analytics.controller");

router.get("/stats", adminAuth, getDashboardStats);

module.exports = router;