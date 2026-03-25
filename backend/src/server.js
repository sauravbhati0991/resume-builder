const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// ROUTES
const adminRoutes = require("./routes/admin.routes");
const adminAnalyticsRoutes = require("./routes/admin.analytics.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const templateRoutes = require("./routes/template.routes");
const categoryRoutes = require("./routes/category.routes");
const verificationRoutes = require("./routes/verification.routes");
const resumeRoutes = require("./routes/resume.routes");

// BLOG ROUTES
const blogRoutes = require("./routes/blog.routes");
const adminBlogRoutes = require("./routes/admin.blog.routes");

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const resumeUploadRoutes = require("./routes/resumeUpload.routes");


app.use("/api/resume-upload", resumeUploadRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("RESUMEA Backend running 🚀"));

// ✅ ADMIN (existing)
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAnalyticsRoutes);

// ✅ BLOGS
app.use("/api/blogs", blogRoutes);               // public: GET /api/blogs
app.use("/api/admin/blogs", adminBlogRoutes);    // admin:  CRUD /api/admin/blogs

// ✅ AUTH + USERS
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ✅ TEMPLATES + CATEGORIES
app.use("/api/templates", templateRoutes);
app.use("/api/categories", categoryRoutes);
app.get("/api/verification/ping", (req, res) => {
  res.json({ ok: true });
});
app.use("/api/verification", verificationRoutes);
app.use("/api/resumes", resumeRoutes);
// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));