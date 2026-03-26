import api from "../utils/api";

/**
 * Saves the dynamic resume fields into MongoDB and returns the generated cvNumber.
 * 
 * @param {string} templateId - The ID of the template 
 * @param {string} templateName - The name of the template
 * @param {string} categoryName - The category of the template
 * @param {Object} resumeData - The variable input fields from the template
 * @param {string} pdfUrl - The Cloudinary PDF URL
 * @returns {Promise<string|null>} - The generated CV number
 */
export const saveResumeData = async (templateId, templateName, categoryName, resumeData, pdfUrl = "") => {
  try {
    const payload = {
      templateId,
      templateName: templateName || "",
      categoryName: categoryName || "",
      resumeData,
      pdfUrl: pdfUrl || ""
    };

    // TEMPORARY TESTING: Log the COMPLETE data object going to MongoDB
    console.log("=== COMPLETE MONGODB RESUME PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));

    const response = await api.post("/resumes", payload);

    // Log the successful response from the database
    console.log("=== SUCCESSFULLY SAVED TO MONGODB ===");
    console.log(response.data);

    return response.data.cvNumber;
  } catch (error) {
    console.error("Error saving resume data:", error);
    throw error;
  }
};

/**
 * Uploads a PDF blob to Cloudinary and returns the secure URL.
 * (Simple upload without updating the database immediately)
 * 
 * @param {Blob} pdfBlob - The PDF file as a blob
 * @returns {Promise<string>} - The Cloudinary secure URL
 */
export const uploadResumePDF = async (pdfBlob) => {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, "resume.pdf");

    const response = await api.post("/resume-upload/upload-pdf-only", formData);

    return response.data.pdfUrl;
  } catch (error) {
    console.error("Error uploading PDF to Cloudinary:", error);
    throw error;
  }
};

/**
 * Uploads a PDF blob to Cloudinary using an existing cvNumber.
 * This endpoint updates the Resume record with the pdfUrl.
 * 
 * @param {Blob} pdfBlob - The PDF file as a blob
 * @param {string} cvNumber - The CV number to associate with
 * @returns {Promise<string>} - The Cloudinary secure URL
 */
export const uploadResumeWithId = async (pdfBlob, cvNumber) => {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, `${cvNumber}.pdf`);
    formData.append("cvNumber", cvNumber);

    const response = await api.post("/resume-upload/resume-pdf", formData);

    return response.data.pdfUrl;
  } catch (error) {
    console.error("Error uploading PDF with ID:", error);
    throw error;
  }
};
