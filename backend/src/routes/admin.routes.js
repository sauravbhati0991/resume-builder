const express = require("express");
const { loginAdmin, registerAdmin, getDashboardStats, getUsersList } = require("../controllers/admin.controller");
const adminAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", registerAdmin);
router.post("/login", loginAdmin);

router.get("/stats", adminAuth, getDashboardStats);
router.get("/users", adminAuth, getUsersList);

module.exports = router;