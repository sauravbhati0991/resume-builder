import api from "../utils/api";

/**
 * Saves the dynamic resume fields into MongoDB and returns the generated cvNumber.
 * 
 * @param {string} templateId - The ID of the template 
 * @param {string} templateName - The name of the template
 * @param {string} categoryName - The category of the template
 * @param {Object} resumeData - The variable input fields from the template
 * @returns {Promise<string|null>} - The generated CV number
 */
export const saveResumeData = async (templateId, templateName, categoryName, resumeData) => {
  try {
    const payload = {
      templateId,
      templateName: templateName || "",
      categoryName: categoryName || "",
      resumeData
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
