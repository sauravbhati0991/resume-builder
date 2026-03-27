import api from "../../utils/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, Download, FileText, Plus, Trash2, Eye,
  Briefcase, GraduationCap, User, Code, Loader2, Mail, Phone, MapPin
} from 'lucide-react';


// Importing your existing utils
// import { getTheme } from "../utils/themesEngine";
// import { renderHeader, renderSection } from "../utils/layoutEngine";

export default function AcademicTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  // --- CONFIGURATION: COLORS & DEFAULTS ---
  const templateConfig = {
    name: "Academic Standard",
    primaryColor: "#0f172a", // Slate 900
    accentColor: "#3b82f6",  // Blue 500
    defaultData: {
      firstName: "Arjun",
      lastName: "Kumar",
      title: "Software Developer",
      email: "arjun.dev@example.com",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      summary: "Innovative Software Developer with 5 years of experience in React, Node.js, and cloud architecture.",
      skills: "JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes, Git",
      experience: [
        { role: "Senior Developer", company: "Tech Solutions Inc", dates: "2021 - Present", description: "Lead backend architecture and optimized database queries by 40%." }
      ],
      education: "B.Tech Computer Science, IIT Bombay (2016-2020)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  // UI State
  const [activeTab, setActiveTab] = useState("editor");
  const [zoom, setZoom] = useState(0.8);

  // Section Order
  const [sections, setSections] = useState(["summary", "skills", "experience", "education"]);

  // Theme State - Merging your utils theme with custom colors
  const baseTheme = getTheme("modern");
  const theme = {
    ...baseTheme,
    colors: {
      primary: templateConfig.primaryColor,
      accent: templateConfig.accentColor,
      text: "#333333"
    }
  };

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...data[arrayName]];
    newArray[index][field] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }]
    }));
  };

  const removeExperience = (index) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

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

      {/* --- Header / Toolbar --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4">
          <div className="flex justify-between items-center">

            {/* Left: Back & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/templates')}
                className="inline-flex items-center justify-center text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 h-9 px-3 rounded-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg shadow-sm"
                  style={{ backgroundColor: templateConfig.primaryColor }}
                >
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">
                  {templateConfig.name} Builder
                </span>
              </div>
            </div>

            {/* Right: Actions */}
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
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">

          {/* --- LEFT: Editor Panel --- */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="pb-20 space-y-6">

              {/* Personal Info Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <User className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                  <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                  <InputGroup label="Job Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="md:col-span-2" />
                  <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                  <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                  <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="md:col-span-2" />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <FileText className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Professional Summary</h3>
                </div>
                <textarea
                  rows={4}
                  value={data.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Briefly describe your professional background..."
                />
              </div>

              {/* Experience Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Briefcase className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                    <h3>Experience</h3>
                  </div>
                  <button
                    onClick={addExperience}
                    className="text-sm px-2 py-1 rounded flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{ color: templateConfig.primaryColor, backgroundColor: `${templateConfig.primaryColor}15` }}
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                      <button
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(index, 'role', v, 'experience')} />
                        <InputGroup label="Company" value={exp.company} onChange={(v) => handleArrayChange(index, 'company', v, 'experience')} />
                        <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(index, 'dates', v, 'experience')} className="md:col-span-2" />
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Code className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills</h3>
                </div>
                <textarea
                  rows={3}
                  value={data.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Java, Python, React, etc."
                />
              </div>

              {/* Education Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea
                  rows={3}
                  value={data.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* --- RIGHT: Preview Panel --- */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">

              {/* Preview Content Area */}
              <div className="bg-gray-50 p-6 flex justify-center items-start overflow-auto flex-1 custom-scrollbar">
                <div
                  id="resume-preview"
                  ref={previewRef}
                  className="shadow-2xl bg-white"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm'
                  }}
                >
                  {/* Standard Academic Header */}
                  <div className="border-b-4 pb-6 mb-8" style={{ borderColor: templateConfig.primaryColor }}>
                    <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900 mb-2">
                      {data.firstName} {data.lastName}
                    </h1>
                    <p className="text-lg font-medium text-gray-600 mb-4 uppercase tracking-wider">{data.title}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><Mail size={14} /> {data.email}</div>
                      <div className="flex items-center gap-1"><Phone size={14} /> {data.phone}</div>
                      <div className="flex items-center gap-1"><MapPin size={14} /> {data.location}</div>
                    </div>
                  </div>

                  {/* Summary */}
                  {data.summary && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: templateConfig.primaryColor }}>Professional Profile</h3>
                      <p className="text-sm text-gray-700 leading-relaxed text-justify">{data.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {data.experience.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: templateConfig.primaryColor }}>Professional Experience</h3>
                      <div className="space-y-6">
                        {data.experience.map((job, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-bold text-gray-900">{job.role}</h4>
                              <span className="text-xs font-bold text-gray-500 italic">{job.dates}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{job.company}</div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills & Education Grid */}
                  <div className="grid grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: templateConfig.primaryColor }}>Core Competencies</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.split(',').map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: templateConfig.primaryColor }}>Education</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{data.education}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
                <span>Scroll to see more</span>
                <div className="flex items-center gap-1" style={{ color: templateConfig.primaryColor }}>
                  <Eye className="w-3 h-3" />
                  Preview Mode
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 text-slate-900 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-8 border-slate-900">
            <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase">Resume Saved</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Your standard academic dossier has been successfully synced.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-xl mb-6">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1">CV NUMBER</p>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3.5 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}


// Simple Helper Component for Inputs
const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
    />
  </div>
);