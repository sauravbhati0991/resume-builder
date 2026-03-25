// src/utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath) {
  // uploads from local temp path (multer diskStorage)
  return cloudinary.uploader.upload(filePath, {
    folder: "resumea/blogs",
    resource_type: "image",
  });
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};