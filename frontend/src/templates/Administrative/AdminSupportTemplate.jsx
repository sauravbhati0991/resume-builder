import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
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
  MapPin
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

export default function AdminSupportTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Administrative & Support",
    primaryColor: "#708090", // Slate Gray
    accentColor: "#4682B4",  // Steel Blue
    defaultData: {
      firstName: "Sarah",
      lastName: "Jenkins",
      title: "Executive Assistant",
      email: "sarah.admin@example.com",
      phone: "+1 234 567 890",
      location: "New York, USA",
      summary: "Organized Executive Assistant with 7 years of experience supporting C-level executives. Expert in travel coordination, calendar management, and office operations.",
      skills: "Office Management, Data Entry, Microsoft Office, Scheduling, QuickBooks, Communication",
      experience: [
        { role: "Executive Assistant", company: "Global Corp", dates: "2018 - Present", description: "Managed calendar for CEO, coordinated international travel, and prepared board meeting materials." }
      ],
      education: "BA Business Administration, NYU (2014-2018)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(templateConfig.defaultData);

  // --- HANDLERS ---
  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  
  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...data[arrayName]];
    newArray[index][field] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addExperience = () => setData(prev => ({
    ...prev,
    experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }]
  }));

  const removeExperience = (index) => setData(prev => ({
    ...prev,
    experience: prev.experience.filter((_, i) => i !== index)
  }));

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
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        // FORCE WIDTH: Ensures the canvas knows it's A4 size, preventing wrapping
        windowWidth: 794 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/templates')} className="inline-flex items-center justify-center text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 h-9 px-3 rounded-md">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg shadow-sm" style={{ backgroundColor: templateConfig.primaryColor }}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">{templateConfig.name} Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
              </button>
              <button onClick={downloadPDF} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity hover:opacity-90" style={{ backgroundColor: templateConfig.accentColor }}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          
          {/* --- EDITOR (Left) --- */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="pb-20 space-y-6">
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
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

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <FileText className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Professional Summary</h3>
                </div>
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Briefcase className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                    <h3>Experience</h3>
                  </div>
                  <button onClick={addExperience} className="text-sm px-2 py-1 rounded flex items-center gap-1 hover:opacity-80" style={{ color: templateConfig.primaryColor, backgroundColor: `${templateConfig.primaryColor}15` }}>
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                      <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(index, 'role', v, 'experience')} />
                        <InputGroup label="Company" value={exp.company} onChange={(v) => handleArrayChange(index, 'company', v, 'experience')} />
                        <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(index, 'dates', v, 'experience')} className="md:col-span-2" />
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Code className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* --- PREVIEW (Right) --- */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(to right, ${templateConfig.primaryColor}, ${templateConfig.accentColor})` }}>
              <span className="text-sm font-medium text-white/90">Live Preview</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-white hover:text-blue-200">-</button>
                <span className="text-xs text-white font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="text-white hover:text-blue-200">+</button>
              </div>
            </div>

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
                <div ref={previewRef} className="h-full w-full bg-white">
                  
                  {/* --- FIX: Using CSS Grid for robust PDF column separation --- */}
                  <div style={{ display: 'grid', gridTemplateColumns: '35% 65%', height: '100%', minHeight: '297mm' }}>
                    
                    {/* Sidebar Column */}
                    <div 
                      style={{ 
                        backgroundColor: templateConfig.primaryColor, 
                        color: 'white', 
                        padding: '30px',
                        height: '100%' 
                      }}
                    >
                      <div className="mb-8">
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '10px' }}>
                          {data.firstName}<br/>{data.lastName}
                        </h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, borderTop: `1px solid ${templateConfig.accentColor}`, paddingTop: '10px', display: 'inline-block' }}>
                          {data.title}
                        </p>
                      </div>
                      
                      <div style={{ fontSize: '12px', opacity: 0.9, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                        {data.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12}/> {data.email}</div>}
                        {data.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12}/> {data.phone}</div>}
                        {data.location && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12}/> {data.location}</div>}
                      </div>

                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', letterSpacing: '1px' }}>
                          Skills
                        </h3>
                        <ul style={{ fontSize: '12px', listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.6' }}>
                          {data.skills.split(',').map((skill, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>• {skill.trim()}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', letterSpacing: '1px' }}>
                          Education
                        </h3>
                        <p style={{ fontSize: '12px', lineHeight: '1.5' }}>{data.education}</p>
                      </div>
                    </div>

                    {/* Main Content Column */}
                    <div style={{ padding: '30px', color: '#333' }}>
                      <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: templateConfig.primaryColor, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          Professional Profile
                        </h2>
                        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{data.summary}</p>
                      </section>

                      <section>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px', color: templateConfig.primaryColor }}>
                          Work History
                        </h2>
                        {data.experience.map((exp, i) => (
                          <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{exp.role}</h3>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f3f4f6', color: templateConfig.primaryColor }}>
                                {exp.dates}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', opacity: 0.7 }}>
                              {exp.company}
                            </div>
                            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', margin: 0 }}>{exp.description}</p>
                          </div>
                        ))}
                      </section>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
              <span>Scroll to see more</span>
              <div className="flex items-center gap-1" style={{ color: templateConfig.primaryColor }}>
                <Eye className="w-3 h-3"/> Preview Mode
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}