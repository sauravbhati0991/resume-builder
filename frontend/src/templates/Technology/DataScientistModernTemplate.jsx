import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin } from "lucide-react";

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default function DataScientistModernTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Data Scientist Modern",
    primaryColor: "#1E90FF",
    accentColor: "#333333",
    defaultData: {
      firstName: "Priya",
      lastName: "Patel",
      title: "Data Scientist",
      email: "priya.data@example.com",
      phone: "+1 555 9988",
      location: "New York, NY",
      summary:
        "Analytical Data Scientist with a strong background in predictive modeling and machine learning. Skilled in extracting insights from massive datasets to drive business strategy. Proficient in Python, R, and SQL.",
      skills: "Python, R, SQL, TensorFlow, PyTorch, Tableau, Big Data (Spark/Hadoop), Statistical Analysis",
      experience: [
        {
          role: "Data Scientist",
          company: "Alpha Analytics",
          dates: "2021 - Present",
          description:
            "Developed predictive models for customer churn reducing attrition by 15%. Visualized complex data trends using Tableau for executive stakeholders."
        },
        {
          role: "Data Analyst",
          company: "Market Insights",
          dates: "2018 - 2021",
          description:
            "Cleaned and processed large datasets for analysis. Generated monthly performance reports using SQL and Excel."
        }
      ],
      education: "M.S. Data Science, Columbia University (2018)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

  const handleInputChange = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...data[arrayName]];
    newArray[index][field] = value;
    setData((prev) => ({ ...prev, [arrayName]: newArray }));
  };

  const addExperience = () =>
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }]
    }));

  const removeExperience = (index) =>
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));

  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`resume_${templateConfig.name}`, JSON.stringify(data));
      setIsSaving(false);
    }, 1000);
  };

  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Technology and IT",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: -window.scrollY
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output("blob");

      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await worker.save();

      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Resume Save Failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = async () => {
    setShowReplaceModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/templates")}
              className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveResume}
              disabled={isSaving}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
            </button>
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: templateConfig.primaryColor }}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          {/* EDITOR */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange("firstName", v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange("lastName", v)} />
                <InputGroup label="Title" value={data.title} onChange={(v) => handleInputChange("title", v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange("email", v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange("phone", v)} />
                <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange("location", v)} className="col-span-2" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Profile</h3>
              <textarea
                rows={4}
                value={data.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              />
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">Experience</h3>
                <button onClick={addExperience} className="text-sm text-blue-600 font-bold">
                  + Add
                </button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                  <button
                    onClick={() => removeExperience(i)}
                    className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, "role", v, "experience")} />
                    <InputGroup label="Company" value={exp.company} onChange={(v) => handleArrayChange(i, "company", v, "experience")} />
                    <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(i, "dates", v, "experience")} className="col-span-2" />
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleArrayChange(i, "description", e.target.value, "experience")}
                      className="col-span-2 border rounded p-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
              <InputGroup label="Skills" value={data.skills} onChange={(v) => handleInputChange("skills", v)} />
              <div className="h-4"></div>
              <InputGroup label="Education" value={data.education} onChange={(v) => handleInputChange("education", v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div
              ref={previewRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              {/* Header */}
              <div style={{ padding: "50px 50px 30px", borderBottom: `2px solid ${templateConfig.primaryColor}` }}>
                <h1 style={{ fontSize: "36px", fontWeight: "bold", color: templateConfig.accentColor, marginBottom: "5px" }}>
                  {data.firstName} {data.lastName}
                </h1>
                <p style={{ fontSize: "18px", color: templateConfig.primaryColor, fontWeight: "bold", marginBottom: "20px" }}>
                  {data.title}
                </p>
                <div style={{ display: "flex", gap: "25px", fontSize: "12px", color: "#555" }}>
                  <span>{data.email}</span>
                  <span>{data.phone}</span>
                  <span>{data.location}</span>
                </div>
              </div>

              <div style={{ padding: "40px 50px", flex: 1 }}>
                <div style={{ marginBottom: "40px" }}>
                  <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#333" }}>{data.summary}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px" }}>
                  {/* Left Col */}
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: templateConfig.accentColor, marginBottom: "15px" }}>
                      Skills
                    </h3>
                    <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                      {data.skills.split(",").map((s, i) => (
                        <li
                          key={i}
                          style={{
                            fontSize: "12px",
                            color: "#444",
                            marginBottom: "6px",
                            borderLeft: `3px solid ${templateConfig.primaryColor}`,
                            paddingLeft: "10px"
                          }}
                        >
                          {s.trim()}
                        </li>
                      ))}
                    </ul>

                    <h3 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: templateConfig.accentColor, marginBottom: "15px", marginTop: "30px" }}>
                      Education
                    </h3>
                    <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#444" }}>{data.education}</p>
                  </div>

                  {/* Right Col */}
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: templateConfig.accentColor, marginBottom: "20px" }}>
                      Work History
                    </h3>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: "30px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#222", marginBottom: "2px" }}>{exp.role}</h4>
                        <div style={{ fontSize: "13px", color: templateConfig.primaryColor, fontWeight: "bold", marginBottom: "8px" }}>
                          {exp.company} <span style={{ color: "#999", fontWeight: "normal" }}>| {exp.dates}</span>
                        </div>
                        <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#555" }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CV Number Footer */}
              {generatedCvNumber && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "20px",
                    fontSize: "9px",
                    color: "#94a3b8",
                    fontFamily: "monospace"
                  }}
                >
                  ID: {generatedCvNumber} • Verify at: resumea.com/cv/{generatedCvNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Resume?</h3>
            <p className="text-sm text-gray-600 mb-6">This resume will be replaced with the latest changes.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={runDownloadProcess}
                disabled={isDownloading}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-70"
                style={{ backgroundColor: templateConfig.accentColor }}
              >
                {isDownloading ? "Generating..." : "Yes, Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">Resume Saved Successfully</h3>
            <p className="text-sm text-gray-600 mb-2">Your latest resume has been uploaded and downloaded.</p>
            <p className="text-sm font-semibold text-gray-900 mb-6">CV Number: {generatedCvNumber}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-5 py-2 rounded-lg text-white"
              style={{ backgroundColor: templateConfig.primaryColor }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}