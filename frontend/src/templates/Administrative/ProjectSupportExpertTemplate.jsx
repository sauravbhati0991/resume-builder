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

export default function ProjectSupportExpertTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Project Support Expert",
    primaryColor: "#D3D3D3",
    accentColor: "#4682B4",
    defaultData: {
      firstName: "Marcus",
      lastName: "Chen",
      title: "Project Support Specialist",
      email: "marcus.chen@example.com",
      phone: "(555) 789-0123",
      location: "San Francisco, CA",
      summary:
        "Detail-oriented Project Support Expert with 6 years of experience facilitating complex IT and marketing projects. Adept at maintaining project schedules, tracking deliverables, and bridging communication across cross-functional teams.",
      skills:
        "Jira, Trello, Asana, Agile/Scrum basics, Risk Tracking, Meeting Facilitation, Vendor Coordination, Excel (Advanced)",
      experience: [
        {
          role: "Project Support Specialist",
          company: "BuildTech Innovations",
          dates: "2020 - Present",
          description:
            "Maintained project documentation and Jira boards for 4 simultaneous enterprise software deployments. Followed up on outstanding action items, ensuring 95% on-time milestone delivery."
        },
        {
          role: "Project Coordinator",
          company: "Creative Digital",
          dates: "2017 - 2020",
          description:
            "Assisted project managers in drafting project scope documents. Managed weekly status reports and coordinated resource allocation schedules."
        }
      ],
      education: "B.S. in Information Systems, California State University (2017)"
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
      experience: [
        ...prev.experience,
        { role: "", company: "", dates: "", description: "" }
      ]
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
        categoryName: "Administrative and Support",
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
              style={{ backgroundColor: templateConfig.accentColor }}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
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
              <h3 className="text-lg font-bold mb-4">Personal Info</h3>
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
              <h3 className="text-lg font-bold mb-4">Summary</h3>
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
                flexDirection: "column"
              }}
            >
              {/* Header in Accent Color */}
              <div style={{ backgroundColor: templateConfig.accentColor, color: "white", padding: "35px 45px" }}>
                <h1
                  style={{
                    fontSize: "38px",
                    fontWeight: "bold",
                    margin: "0 0 5px 0",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  {data.firstName} {data.lastName}
                </h1>
                <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 15px 0", opacity: 0.9 }}>
                  {data.title}
                </h2>
                <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "white", opacity: 0.8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Mail size={12} /> {data.email}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Phone size={12} /> {data.phone}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={12} /> {data.location}
                  </span>
                </div>
              </div>

              {/* Split Body Layout */}
              <div style={{ display: "flex", flex: 1 }}>
                {/* Main Content (Experience & Summary) */}
                <div style={{ width: "65%", padding: "40px 30px 40px 45px" }}>
                  <section style={{ marginBottom: "35px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: templateConfig.accentColor,
                        textTransform: "uppercase",
                        marginBottom: "10px",
                        borderBottom: `2px solid ${templateConfig.primaryColor}`,
                        paddingBottom: "5px"
                      }}
                    >
                      Profile
                    </h3>
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{data.summary}</p>
                  </section>

                  <section>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: templateConfig.accentColor,
                        textTransform: "uppercase",
                        marginBottom: "20px",
                        borderBottom: `2px solid ${templateConfig.primaryColor}`,
                        paddingBottom: "5px"
                      }}
                    >
                      Project Experience
                    </h3>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: "25px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#333", margin: 0 }}>{exp.role}</h4>
                          <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>{exp.dates}</span>
                        </div>
                        <div style={{ fontSize: "13px", color: templateConfig.accentColor, fontWeight: "600", marginBottom: "8px" }}>
                          {exp.company}
                        </div>
                        <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", margin: 0 }}>{exp.description}</p>
                      </div>
                    ))}
                  </section>
                </div>

                {/* Right Sidebar (Skills & Education in Light Gray) */}
                <div style={{ width: "35%", backgroundColor: templateConfig.primaryColor, padding: "40px 30px" }}>
                  <section style={{ marginBottom: "40px" }}>
                    <div
                      style={{
                        backgroundColor: templateConfig.accentColor,
                        color: "white",
                        padding: "8px 15px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        textTransform: "uppercase",
                        marginBottom: "15px",
                        borderRadius: "4px"
                      }}
                    >
                      Technical Skills
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {data.skills.split(",").map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "12px",
                            color: "#333",
                            borderBottom: "1px solid #bbb",
                            paddingBottom: "4px"
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div
                      style={{
                        backgroundColor: templateConfig.accentColor,
                        color: "white",
                        padding: "8px 15px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        textTransform: "uppercase",
                        marginBottom: "15px",
                        borderRadius: "4px"
                      }}
                    >
                      Education
                    </div>
                    <p style={{ fontSize: "12px", color: "#333", lineHeight: "1.5" }}>{data.education}</p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Update Resume?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This resume will be replaced with the latest changes.
            </p>

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
            <h3 className="text-lg font-bold text-green-700 mb-2">
              Resume Saved Successfully
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Your latest resume has been uploaded and downloaded.
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-6">
              CV Number: {generatedCvNumber}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-5 py-2 rounded-lg text-white"
              style={{ backgroundColor: templateConfig.accentColor }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}