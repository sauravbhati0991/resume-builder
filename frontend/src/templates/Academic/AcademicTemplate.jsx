import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { 
  ArrowLeft, Save, Download, FileText, Plus, Trash2, Eye, 
  Briefcase, GraduationCap, User, Code, Loader2
} from 'lucide-react';

// Importing your existing utils
// import { getTheme } from "../utils/themesEngine";
// import { renderHeader, renderSection } from "../utils/layoutEngine";

export default function TechTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION: COLORS & DEFAULTS ---
  const templateConfig = {
    name: "Technology & IT",
    primaryColor: "#1E90FF", // Electric Blue
    accentColor: "#333333",  // Black
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

  // UI State
  const [activeTab, setActiveTab] = useState("editor");
  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);

  // Resume Data State
  const [data, setData] = useState(templateConfig.defaultData);

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

  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`resume_${templateConfig.name}`, JSON.stringify(data));
      setIsSaving(false);
      alert("Resume saved successfully!");
    }, 1000);
  };

  const downloadPDF = () => {
    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${data.firstName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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
                onClick={saveResume}
                disabled={isSaving}
                className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}
                Save
              </button>
              
              <button 
                onClick={downloadPDF}
                className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: templateConfig.accentColor }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
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
              
              {/* Preview Toolbar */}
              <div 
                className="px-6 py-4 flex items-center justify-between shrink-0"
                style={{ background: `linear-gradient(to right, ${templateConfig.primaryColor}, ${templateConfig.accentColor})` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                  </div>
                  <span className="text-sm font-medium text-white/90">Live Preview</span>
                </div>
                <div className="flex items-center space-x-3">
                   <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-white hover:text-blue-200">-</button>
                      <span className="text-xs text-white font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="text-white hover:text-blue-200">+</button>
                   </div>
                </div>
              </div>

              {/* Preview Content Area */}
              <div className="bg-gray-50 p-6 flex justify-center items-start overflow-auto flex-1 custom-scrollbar">
                <div 
                  className="shadow-2xl transition-transform duration-200 bg-white"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    width: '210mm', 
                    minHeight: '297mm', 
                  }}
                >
                  <div ref={previewRef} className={`h-full w-full p-8 ${theme.bg || ''} ${theme.text || ''}`}>
                    
                    {/* Header with Dynamic Theme */}
                    {renderHeader("modern", { data, theme: { ...theme, colors: { primary: templateConfig.primaryColor, accent: templateConfig.accentColor } } })}
                    
                    {sections.map((section) => (
                      <div key={section} className="mb-4">
                        {(() => {
                           const sectionProps = { 
                             theme: { ...theme, colors: { primary: templateConfig.primaryColor, accent: templateConfig.accentColor } } 
                           };

                          switch (section) {
                            case "summary":
                              return data.summary ? renderSection("classic", { title: "Summary", children: data.summary, ...sectionProps }) : null;
                            case "skills":
                              return data.skills ? renderSection("classic", { title: "Skills", children: data.skills, ...sectionProps }) : null;
                            case "experience":
                              return data.experience.length > 0 ? renderSection("classic", { 
                                title: "Experience", 
                                ...sectionProps,
                                children: data.experience.map((job, i) => (
                                  <div key={i} className="mb-3">
                                    <div className="font-semibold" style={{ color: templateConfig.accentColor }}>{job.role}</div>
                                    <div className="text-sm opacity-75">{job.company} | {job.dates}</div>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{job.description}</p>
                                  </div>
                                )) 
                              }) : null;
                            case "education":
                              return data.education ? renderSection("classic", { title: "Education", children: data.education, ...sectionProps }) : null;
                            default: return null;
                          }
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
                <span>Scroll to see more</span>
                <div className="flex items-center gap-1" style={{ color: templateConfig.primaryColor }}>
                  <Eye className="w-3 h-3"/>
                  Preview Mode
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
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