import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { CATEGORY_TEMPLATE_MAP, SPECIFIC_TEMPLATE_MAP } from "../templates/registry";
import { Loader2 } from "lucide-react";

export default function ResumeViewer() {

  const { cvNumber } = useParams();

  const [loading, setLoading] = useState(true);
  const [SelectedComponent, setSelectedComponent] = useState(null);
  const [resumeData, setResumeData] = useState(null);


  useEffect(() => {

    const loadResume = async () => {

      try {

        // ===============================
        // Fetch resume using CV number
        // ===============================
        const res = await api.get(`/resumes/cv/${cvNumber}`);

        const resume = res.data;

        if (!resume) {
          throw new Error("Resume not found");
        }

        setResumeData(resume.resumeData || {});


        // ===============================
        // Fetch template
        // ===============================
        const templateRes = await api.get(`/templates/${resume.templateId}`);

        const template = templateRes.data;

        if (!template) {
          throw new Error("Template not found");
        }


        const categoryId =
          typeof template.category === "object"
            ? template.category._id
            : template.category;


        // ===============================
        // Try specific template mapping
        // ===============================
        let Component = SPECIFIC_TEMPLATE_MAP[template._id];


        // ===============================
        // Fallback to category template
        // ===============================
        if (!Component) {
          Component = CATEGORY_TEMPLATE_MAP[categoryId];
        }


        if (!Component) {
          throw new Error("Template component not registered");
        }


        setSelectedComponent(() => Component);


      } catch (err) {

        console.error("Failed to load resume:", err);

      } finally {

        setLoading(false);

      }

    };

    loadResume();

  }, [cvNumber]);



  // ===============================
  // Loading screen
  // ===============================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }



  // ===============================
  // Template missing
  // ===============================
  if (!SelectedComponent) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow">
          <h2 className="text-lg font-bold text-red-600">
            Resume Template Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The template used to create this resume is unavailable.
          </p>
        </div>
      </div>
    );
  }



  // ===============================
  // Render Resume Template
  // ===============================
  return (
    <div className="flex justify-center bg-gray-100 p-10 min-h-screen">
      <SelectedComponent
        data={resumeData}
        viewMode={true}
      />
    </div>
  );
}