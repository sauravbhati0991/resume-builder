require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Load your existing Template model
const Template = require("./src/models/Template");

// Configure Cloudinary manually just to be safe
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PREVIEWS_DIR = path.join(__dirname, "../frontend/public/template-previews");

async function migrateImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Check if the directory exists
    if (!fs.existsSync(PREVIEWS_DIR)) {
      console.error("Preview directory not found:", PREVIEWS_DIR);
      process.exit(1);
    }

    // Read all files in the directory
    const files = fs.readdirSync(PREVIEWS_DIR);
    const imageFiles = files.filter(f => f.endsWith(".png") || f.endsWith(".jpg"));

    console.log(`Found ${imageFiles.length} images to process.\n`);

    for (const file of imageFiles) {
      // e.g. "Executive Assistant Elite.png" -> "Executive Assistant Elite"
      const templateName = path.basename(file, path.extname(file)).trim();
      const filePath = path.join(PREVIEWS_DIR, file);

      console.log(`Processing: "${templateName}"`);

      // Handle the UX-UI edgecase where Windows doesn't allow slashes in filenames
      let searchName = templateName;
      if (searchName.includes("UX-UI") || searchName.includes("UX-UI Design Modern")) {
        searchName = searchName.replace("UX-UI", "UX/UI");
      }

      // 1. Search DB for matching template
      // We do case-insensitive search to be safe
      const template = await Template.findOne({
        name: { $regex: new RegExp(`^${searchName}$`, "i") }
      });

      if (!template) {
        console.log(`⏭️  SKIPPED: Could not find template named "${templateName}" in DB.\n`);
        continue;
      }

      // Check if it already has a secure url
      if (template.previewImage && template.previewImage.includes("cloudinary.com")) {
        console.log(`✅ SKIPPED: Template "${templateName}" already has a Cloudinary URL.\n`);
        continue;
      }

      // 2. Upload to Cloudinary
      console.log(`☁️  Uploading "${file}" to Cloudinary...`);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "resume_templates", // Group them nicely in your Cloudinary dash
        use_filename: true,
        unique_filename: false
      });

      // 3. Update the Database
      template.previewImage = uploadResult.secure_url;
      await template.save();

      console.log(`🎉 SUCCESS: Updated DB with URL: ${uploadResult.secure_url}\n`);
    }

    console.log("========== MIGRATION COMPLETE! ==========");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    mongoose.connection.close();
  }
}

migrateImages();
