const express = require("express");
const userAuth = require("../middleware/userAuth.middleware");
const { getMe, updateOnboarding } = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", userAuth, getMe);
router.patch("/me/onboarding", userAuth, updateOnboarding);

module.exports = router;