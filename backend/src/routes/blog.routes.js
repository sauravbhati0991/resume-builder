const express = require("express");
const router = express.Router();

const { listActiveBlogs } = require("../controllers/blog.controller");

router.get("/", listActiveBlogs);

module.exports = router;