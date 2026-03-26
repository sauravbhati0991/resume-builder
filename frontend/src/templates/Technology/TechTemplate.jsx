import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Briefcase, 
  GraduationCap, 
  User, 
  Code, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2
} from 'lucide-react';

// Common Input Component
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

export default function TechTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
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
      summary: "Innovative Software Developer with 5 years of experience in React, Node.js, and cloud architecture. Passionate about building scalable, user-centric web applications.",
      skills: "JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes, Git, SQL, NoSQL",
      experience: [
        { role: "Senior Developer", company: "Tech Solutions Inc", dates: "2021 - Present", description: "Lead backend architecture and optimized database queries by 40%. Mentored junior developers and implemented CI/CD pipelines." }
      ],
      education: "B.Tech Computer Science, IIT Bombay (2016-2020)"
    }
  };

  // UI State
  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");

  // Resume Data State
  const [data, setData] = useState(initialData || templateConfig.defaultData);

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
                className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {generatedCvNumber || cvNumber ? "Update_Registry" : "Sync_on_Save"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 ${generatedCvNumber
                  ? "hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
                style={{ backgroundColor: generatedCvNumber ? templateConfig.accentColor : undefined }}
              >
                <Download className="w-4 h-4 mr-2" /> PORTFOLIO_EXPORT
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
                  <div id="resume-preview" ref={previewRef} className="h-full w-full bg-white">
                    {/* --- TECH LAYOUT (CSS GRID) --- */}
                    <div className="h-full w-full p-8 font-sans text-slate-800">
                      
                      {/* Header */}
                      <header className="border-b-4 pb-6 mb-6" style={{ borderColor: templateConfig.primaryColor }}>
                        <h1 className="text-4xl font-bold uppercase tracking-widest" style={{ color: templateConfig.primaryColor }}>
                          {data.firstName} <span className="text-slate-900">{data.lastName}</span>
                        </h1>
                        <p className="text-xl mt-2 font-light">{data.title}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                          {data.email && <div className="flex items-center gap-1"><Mail size={14}/> {data.email}</div>}
                          {data.phone && <div className="flex items-center gap-1"><Phone size={14}/> {data.phone}</div>}
                          {data.location && <div className="flex items-center gap-1"><MapPin size={14}/> {data.location}</div>}
                        </div>
                      </header>

                      {/* Main Grid Layout - Force grid-template-columns for PDF safety */}
                      <div style={{ display: 'grid', gridTemplateColumns: '65% 30%', gap: '5%' }}>
                        
                        {/* Left Column (Main) */}
                        <div className="space-y-6">
                          <section>
                            <h3 className="text-lg font-bold uppercase mb-3 flex items-center gap-2" style={{ color: templateConfig.primaryColor }}>
                              <User size={18}/> Profile
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
                          </section>

                          <section>
                            <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2" style={{ color: templateConfig.primaryColor }}>
                              <Briefcase size={18}/> Experience
                            </h3>
                            {data.experience.map((exp, i) => (
                              <div key={i} className="mb-6 relative border-l-2 pl-4" style={{ borderColor: templateConfig.accentColor }}>
                                {/* Timeline Dot - using inline styles to ensure PDF renders it */}
                                <div style={{ 
                                  position: 'absolute', 
                                  left: '-9px', 
                                  top: '0', 
                                  width: '16px', 
                                  height: '16px', 
                                  borderRadius: '50%', 
                                  backgroundColor: 'white', 
                                  border: `2px solid ${templateConfig.accentColor}` 
                                }}></div>
                                <h4 className="font-bold text-md">{exp.role}</h4>
                                <div className="text-sm font-semibold mb-1" style={{ color: templateConfig.primaryColor }}>{exp.company}</div>
                                <p className="text-xs text-slate-500 mb-2">{exp.dates}</p>
                                <p className="text-sm text-slate-700">{exp.description}</p>
                              </div>
                            ))}
                          </section>
                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="space-y-6">
                          <section>
                            <h3 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ borderColor: templateConfig.accentColor }}>Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {data.skills.split(',').map((skill, i) => (
                                <span key={i} className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: templateConfig.accentColor }}>
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </section>

                          <section>
                            <h3 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ borderColor: templateConfig.accentColor }}>Education</h3>
                            <p className="text-sm font-semibold">{data.education}</p>
                          </section>
                        </div>

                      </div>
                    </div>
                    {/* --- END TECH LAYOUT --- */}
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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-blue-500">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-blue-100">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">System Synchronized</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-blue-600/30 underline-offset-4 tracking-wide text-slate-900">
              Your professional instance has been deployed to the global registry.
            </p>
            <div className="bg-slate-900 py-4 px-6 rounded-2xl font-mono font-bold text-blue-400 mb-8 tracking-[0.2em] text-xl shadow-inner border-2 border-slate-800 uppercase">
              {generatedCvNumber}
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all active:scale-95"
              style={{ backgroundColor: templateConfig.primaryColor }}
            >
              Return to Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}