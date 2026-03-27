import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function OperationsCoordinatorProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Operations Coordinator Pro",
    primaryColor: "#D3D3D3",
    accentColor: "#4682B4",
    defaultData: {
      firstName: "Taylor",
      lastName: "Brooks",
      title: "Operations Coordinator",
      email: "taylor.brooks@example.com",
      phone: "(555) 987-6543",
      location: "Denver, CO",
      summary:
        "Results-driven Operations Coordinator adept at bridging the gap between various departments. Specialized in workflow optimization, inventory management, and ensuring seamless day-to-day business activities.",
      skills:
        "Workflow Optimization, Logistics, Inventory Control, CRM Software, Process Improvement, Team Collaboration",
      experience: [
        {
          role: "Operations Coordinator",
          company: "Apex Logistics",
          dates: "2020 - Present",
          description:
            "Streamlined supply chain workflows, reducing delivery times by 12%. Coordinated communication between warehouse and sales teams."
        },
        {
          role: "Operations Assistant",
          company: "Retail Innovations",
          dates: "2017 - 2020",
          description:
            "Maintained inventory tracking system for 5 retail locations. Prepared weekly operational reports for regional managers."
        }
      ],
      education: "B.S. Supply Chain Management, Colorado State (2017)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

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
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const cvNumber = await saveAndGeneratePDF(data);
      if (cvNumber) {
        setGeneratedCvNumber(cvNumber);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePdfDownload = async (cvNumber) => {
    try {
      const res = await api.get(`/resumes/view/${cvNumber}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF download failed", err);
    }
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
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="mr-2" />
              )}

              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md ${generatedCvNumber
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Download className="mr-2" /> Download
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
              id="resume-preview"
              ref={previewRef}
              style={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: "flex"
              }}
            >
              {/* Left Sidebar */}
              <div style={{ width: "32%", backgroundColor: templateConfig.primaryColor, padding: "40px 25px", color: "#333" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: templateConfig.accentColor,
                    borderRadius: "50%",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "20px"
                  }}
                >
                  {data.firstName[0]}
                  {data.lastName[0]}
                </div>

                <div style={{ marginBottom: "35px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "bold", color: templateConfig.accentColor, textTransform: "uppercase", marginBottom: "10px" }}>
                    Contact
                  </h3>
                  <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Mail size={12} /> <span style={{ wordBreak: "break-all" }}>{data.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Phone size={12} /> {data.phone}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={12} /> {data.location}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "35px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "bold", color: templateConfig.accentColor, textTransform: "uppercase", marginBottom: "10px" }}>
                    Skills
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {data.skills.split(",").map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          borderLeft: `3px solid ${templateConfig.accentColor}`
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "bold", color: templateConfig.accentColor, textTransform: "uppercase", marginBottom: "10px" }}>
                    Education
                  </h3>
                  <p style={{ fontSize: "12px", lineHeight: "1.5" }}>{data.education}</p>
                </div>
              </div>

              {/* Right Body */}
              <div style={{ width: "68%", padding: "40px 35px" }}>
                <div style={{ marginBottom: "30px", borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: "20px" }}>
                  <h1
                    style={{
                      fontSize: "38px",
                      fontWeight: "900",
                      color: templateConfig.accentColor,
                      lineHeight: "1.1",
                      textTransform: "uppercase",
                      marginBottom: "5px"
                    }}
                  >
                    {data.firstName} {data.lastName}
                  </h1>
                  <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#555", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {data.title}
                  </h2>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: templateConfig.accentColor,
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ width: "20px", height: "2px", backgroundColor: templateConfig.accentColor }}></span> Summary
                  </h3>
                  <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{data.summary}</p>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: templateConfig.accentColor,
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ width: "20px", height: "2px", backgroundColor: templateConfig.accentColor }}></span> Experience
                  </h3>
                  <div style={{ position: "relative", borderLeft: `2px solid ${templateConfig.primaryColor}`, marginLeft: "10px", paddingLeft: "20px" }}>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: "25px", position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            width: "10px",
                            height: "10px",
                            backgroundColor: templateConfig.accentColor,
                            borderRadius: "50%",
                            left: "-26px",
                            top: "4px"
                          }}
                        ></div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#333", margin: 0 }}>{exp.role}</h4>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: templateConfig.accentColor }}>{exp.dates}</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#666", fontStyle: "italic", marginBottom: "8px" }}>{exp.company}</div>
                        <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.5", margin: 0 }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



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