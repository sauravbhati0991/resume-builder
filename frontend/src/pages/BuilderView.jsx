import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { CATEGORY_TEMPLATE_MAP, SPECIFIC_TEMPLATE_MAP } from "../templates/registry";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { saveResumeData } from "../services/resumeService";

export default function BuilderView() {

  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [SelectedComponent, setSelectedComponent] = useState(null);
  const [templateInfo, setTemplateInfo] = useState(null);

  const templatesBasePath = location.pathname.startsWith("/stu")
    ? "/stu/templates"
    : location.pathname.startsWith("/pro")
    ? "/pro/templates"
    : "/templates";


  /**
   * SAVE RESUME DATA
   */
  const saveResume = async (resumeData) => {
    try {
      const cvNumber = await saveResumeData(
        templateId,
        templateInfo?.name || "",
        templateInfo?.category?.name || "",
        resumeData
      );
      return cvNumber;
    } catch (err) {
      console.error("Resume save failed", err);
      alert("Failed to save resume");
    }
  };


  /**
   * DOWNLOAD + UPLOAD PDF
   */
  const downloadResume = async (resumeData) => {

    try {

      const cvNumber = await saveResume(resumeData);

      if (!cvNumber) return;

      const element = document.getElementById("resume-preview");

      const pdfBlob = await html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          html2canvas: { scale: 3 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .outputPdf("blob");


      // download locally
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvNumber}.pdf`;
      a.click();


      // upload to backend
      const formData = new FormData();
      formData.append("pdf", pdfBlob);
      formData.append("cvNumber", cvNumber);

      await api.post("/resumes/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("PDF uploaded successfully");

    } catch (err) {

      console.error("Download failed", err);

    }

  };


  /**
   * LOAD TEMPLATE
   */
  useEffect(() => {

    const fetchTemplateAndLoadBuilder = async () => {

      try {

        setLoading(true);

        const { data: template } = await api.get(`/templates/${templateId}`);

        if (!template || !template.category) {
          throw new Error("Template or Category data missing");
        }

        setTemplateInfo(template);

        const categoryId =
          typeof template.category === "object"
            ? template.category._id
            : template.category;

        let Component = SPECIFIC_TEMPLATE_MAP[template._id];

        if (!Component) {
          Component = CATEGORY_TEMPLATE_MAP[categoryId];
        }

        if (Component) {
          setSelectedComponent(() => Component);
        }

      } catch (error) {

        console.error("Error loading builder:", error);

      } finally {

        setLoading(false);

      }

    };

    if (templateId) {
      fetchTemplateAndLoadBuilder();
    }

  }, [templateId]);


  /**
   * LOADING SCREEN
   */
  if (loading) {

    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );

  }


  /**
   * BUILDER NOT FOUND
   */
  if (!SelectedComponent) {

    return (
      <div className="h-screen flex items-center justify-center">
        Builder Not Found
      </div>
    );

  }


  /**
   * RENDER BUILDER
   */
  return (
    <SelectedComponent
      templateId={templateId}
      saveResume={saveResume}
      downloadResume={downloadResume}
    />
  );

}