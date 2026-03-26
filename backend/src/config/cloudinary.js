const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===============================
// Upload Image (for blogs)
// ===============================
exports.uploadImageToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "resumea/blogs"
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(file.buffer);
  });
};

// ===============================
// Upload Resume PDF
// ===============================
exports.uploadResumePDF = async (file, cvNumber) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "resumea/resumes",
          resource_type: "image",
          format: "pdf",
          public_id: cvNumber,
          overwrite: true,
          invalidate: true,
          type: "upload",
          access_mode: "public"
        },
        (error, result) => {
          if (error) {
            console.error("[Cloudinary] Upload Stream Error:", error);
            return reject(error);
          }
          console.log("[Cloudinary] Upload Result:", JSON.stringify(result, null, 2));
          resolve(result);
        }
      )
      .end(file.buffer);
  });
};

// ===============================
// Delete File
// ===============================
exports.deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

// ===============================
// Delete Resume PDF
// ===============================
exports.deleteResumePDF = async (cvNumber) => {
  const publicId = `resumea/resumes/${cvNumber}`;
  // Try deleting as both types
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  return cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
};

console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Key:", process.env.CLOUDINARY_API_KEY);