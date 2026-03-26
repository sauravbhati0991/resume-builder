import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

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

export default function CybersecurityAnalystProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Cybersecurity Analyst Pro",
    primaryColor: "#1E90FF",
    accentColor: "#333333",
    defaultData: {
      firstName: "Sam",
      lastName: "Fisher",
      title: "Cybersecurity Analyst",
      email: "sam.sec@example.com",
      phone: "+1 888 777 6666",
      location: "Washington, DC",
      summary:
        "Certified Information Systems Security Professional (CISSP) with expertise in threat hunting, incident response, and vulnerability assessment. Dedicated to protecting enterprise infrastructure from advanced persistent threats.",
      skills: "SIEM (Splunk, QRadar), Intrusion Detection, Penetration Testing, Python scripting, NIST Framework, Firewall Mgmt",
      experience: [
        {
          role: "Senior Security Analyst",
          company: "DefendCorp",
          dates: "2019 - Present",
          description:
            "Monitor SOC events and lead incident response for critical breaches. Conduct quarterly penetration testing and vulnerability scans."
        },
        {
          role: "IT Security Specialist",
          company: "GovSecure",
          dates: "2016 - 2019",
          description:
            "Hardened server configurations and managed firewall policies. Assisted in security audits ensuring GDPR compliance."
        }
      ],
      education: "B.S. Cybersecurity, University of Maryland (2016)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
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
      experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }]
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
               className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 text-blue-600" />}
              {generatedCvNumber || cvNumber ? "Update_Registry" : "Sync_on_Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 ${generatedCvNumber
                ? "hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              style={{ backgroundColor: generatedCvNumber ? templateConfig.primaryColor : undefined }}
            >
              <Download className="w-4 h-4 mr-2" /> PORTFOLIO_EXPORT
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          {/* EDITOR */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Identity</h3>
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
              id="resume-preview"
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
              {/* Header: Dark Tech Feel */}
              <div
                style={{
                  backgroundColor: templateConfig.accentColor,
                  padding: "30px 40px",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", color: templateConfig.primaryColor, fontFamily: "monospace" }}>
                    &lt;secure_profile&gt;
                  </div>
                  <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "5px 0" }}>
                    {data.firstName} {data.lastName}
                  </h1>
                  <p style={{ fontSize: "16px", opacity: 0.8 }}>{data.title}</p>
                </div>
                <div style={{ textAlign: "right", fontSize: "12px" }}>
                  <div>{data.email}</div>
                  <div>{data.phone}</div>
                  <div>{data.location}</div>
                </div>
              </div>

              <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "30px", flex: 1 }}>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: templateConfig.accentColor,
                      borderBottom: `2px solid ${templateConfig.primaryColor}`,
                      paddingBottom: "8px",
                      marginBottom: "10px"
                    }}
                  >
                    Objective
                  </h3>
                  <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#444" }}>{data.summary}</p>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: templateConfig.accentColor,
                      borderBottom: `2px solid ${templateConfig.primaryColor}`,
                      paddingBottom: "8px",
                      marginBottom: "15px"
                    }}
                  >
                    Security Operations Experience
                  </h3>
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: "25px", display: "flex", gap: "20px" }}>
                      <div
                        style={{
                          width: "100px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#666",
                          textAlign: "right",
                          paddingTop: "3px"
                        }}
                      >
                        {exp.dates}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#222", margin: 0 }}>{exp.role}</h4>
                        <div
                          style={{
                            fontSize: "13px",
                            color: templateConfig.primaryColor,
                            fontWeight: "bold",
                            marginBottom: "6px"
                          }}
                        >
                          {exp.company}
                        </div>
                        <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}>{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "auto" }}>
                  <div style={{ backgroundColor: "#f0f4f8", padding: "15px", borderRadius: "4px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>Certifications & Skills</h4>
                    <div style={{ fontSize: "12px", lineHeight: "1.6" }}>{data.skills}</div>
                  </div>
                  <div style={{ backgroundColor: "#f0f4f8", padding: "15px", borderRadius: "4px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>Education</h4>
                    <div style={{ fontSize: "12px", lineHeight: "1.6" }}>{data.education}</div>
                  </div>
                </div>
              </div>

              {/* CV Number Footer Overlay */}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-blue-600">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-blue-100 italic">
               <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic font-bold uppercase">Security Asset Encrypted</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-blue-600/30 underline-offset-4 tracking-wide text-slate-900 font-bold uppercase">
               Your defensive profile has been successfully committed to the global security registry.
            </p>
            <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl mb-8 shadow-inner overflow-hidden flex flex-col items-center">
               <p className="text-[10px] text-blue-500 uppercase font-black tracking-[0.4em] mb-2 font-bold uppercase italic">Archive Reference</p>
               <p className="text-3xl font-black text-blue-400 font-mono tracking-tighter uppercase italic">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all active:scale-95 italic transition-all font-bold uppercase" style={{ backgroundColor: templateConfig.primaryColor }}>Acknowledge Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
}