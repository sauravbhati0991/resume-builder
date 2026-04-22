import { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CATEGORY_TEMPLATE_MAP, SPECIFIC_TEMPLATE_MAP } from "../templates/registry";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

export default function BuilderView() {
  const { templateId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cvNumber = searchParams.get("cv");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [SelectedComponent, setSelectedComponent] = useState(null);
  const [templateInfo, setTemplateInfo] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [currentCvNumber, setCurrentCvNumber] = useState(
    searchParams.get("cv")
  );

  /**
   * SAVE + GENERATE + UPLOAD PDF
   */
  const saveAndGeneratePDF = async (resumeData) => {
    try {
      // 1. Save resume
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateInfo?.name || "",
        categoryName: templateInfo?.category?.name || "",
        resumeData,
        cvNumber: currentCvNumber
      });

      const newCvNumber = res.data.cvNumber;

      if (!newCvNumber) return null;

      setCurrentCvNumber(newCvNumber);

      // 2. Generate PDF
      const element = document.getElementById("resume-preview");

      if (!element) throw new Error("Resume preview not found");

      const pdfBlob = await html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          html2canvas: { scale: 3 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .outputPdf("blob");

      // 3. Upload PDF
      const formData = new FormData();
      formData.append("file", pdfBlob);
      formData.append("cvNumber", newCvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      return newCvNumber;

    } catch (err) {
      console.error("Save + PDF failed", err);
      return null;
    }
  };

  /**
   * LOAD TEMPLATE + EDIT DATA
   */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const { data: template } = await api.get(`/templates/${templateId}`);
        
        // Security check for paid template
        let hasActiveSubscription = false;
        try {
          const uStr = localStorage.getItem("user");
          const oStr = localStorage.getItem("onboarding");
          const u = uStr ? JSON.parse(uStr) : {};
          const o = oStr ? JSON.parse(oStr) : {};
          const expiry = u?.onboarding?.subscriptionExpiry || o?.subscriptionExpiry;
          if (expiry && new Date(expiry) > new Date()) {
            hasActiveSubscription = true;
          }
        } catch (e) {}

        if (template.isPaid && !hasActiveSubscription) {
          // It's a Paid template, and user isn't subscribed
          const basePath = location.pathname.startsWith("/stu") ? "/stu" : "/pro";
          navigate(`${basePath}/pricing`);
          return;
        }

        setTemplateInfo(template);

        // edit mode
        if (cvNumber) {
          const { data } = await api.get(`/resumes/cv/${cvNumber}`);
          setInitialData(data?.resumeData);
        }

        const categoryId =
          typeof template.category === "object"
            ? template.category._id
            : template.category;

        let Component = SPECIFIC_TEMPLATE_MAP[template._id];

        if (!Component) {
          Component = CATEGORY_TEMPLATE_MAP[categoryId];
        }

        setSelectedComponent(() => Component);

      } catch (err) {
        console.error("Builder load error", err);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) init();
  }, [templateId, cvNumber]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!SelectedComponent) {
    return <div>Builder Not Found</div>;
  }

  return (
    <SelectedComponent
      saveAndGeneratePDF={saveAndGeneratePDF}
      initialData={initialData}
      cvNumber={currentCvNumber}
    />
  );
}