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
  MapPin,
  Cpu
} from 'lucide-react';

// Common Input Component
const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-shadow"
    />
  </div>
);

export default function EngineeringTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Engineering",
    primaryColor: "#708090", // Steel Gray - Precision and Structure
    accentColor: "#FF6347",  // Orange - Innovation
    defaultData: {
      firstName: "David",
      lastName: "Wong",
      title: "Senior Civil Engineer",
      email: "d.wong@eng.com",
      phone: "+1 555 4567",
      location: "Seattle, WA",
      summary: "Professional Civil Engineer specializing in structural design and project management. Proven track record of delivering complex infrastructure projects on time and under budget. Expert in AutoCAD, SAP2000, and regulatory compliance.",
      skills: "AutoCAD, Structural Analysis, SAP2000, Project Management, Concrete Design, Steel Structures, Geotechnical Engineering, Python (for Data Analysis)",
      experience: [
        { role: "Project Engineer", company: "BuildIt Corp", dates: "2018 - Present", description: "Managed structural design for a 40-story commercial complex. Coordinated with architects and contractors to resolve design conflicts, reducing construction delays by 15%." }
      ],
      education: "BS Civil Engineering, Univ of Washington (2014-2018)"
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
        windowWidth: 794 // Force A4 width
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
                  <Cpu className="w-4 h-4 text-white" />
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
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
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
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Code className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Technical Skills</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
            </div>
          </div>

          {/* --- RIGHT: Preview --- */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(to right, ${templateConfig.primaryColor}, #333333)` }}>
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
                  
                  {/* --- PDF CONTENT (ENGINEERING GRID LAYOUT) --- */}
                  <div style={{ height: '100%', padding: '2rem', fontFamily: 'Arial, sans-serif', color: '#1e293b' }}>
                    
                    {/* Outer Border Box */}
                    <div style={{ border: `4px solid ${templateConfig.primaryColor}`, height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      
                      {/* Grid Header */}
                      <header style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60% 40%', 
                        borderBottom: `4px solid ${templateConfig.primaryColor}`, 
                        paddingBottom: '1.5rem', 
                        marginBottom: '2rem' 
                      }}>
                        <div>
                          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: '#0f172a' }}>
                            {data.firstName}
                          </h1>
                          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: '#94a3b8' }}>
                            {data.lastName}
                          </h1>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h2 style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 'bold', color: templateConfig.accentColor, marginBottom: '0.5rem' }}>
                            // {data.title}
                          </h2>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                            {data.email} <br/> {data.location} <br/> {data.phone}
                          </div>
                        </div>
                      </header>

                      {/* Main Layout Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '30% 65%', gap: '5%', flex: 1 }}>
                        
                        {/* Left Col (Narrow) - Skills & Ed */}
                        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '1.5rem' }}>
                          <section style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderLeft: `4px solid ${templateConfig.primaryColor}` }}>
                              Technical Skills
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {data.skills.split(',').map((s,i) => (
                                <span key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', backgroundColor: '#fff', color: '#334155' }}>
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          </section>

                          <section>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderLeft: `4px solid ${templateConfig.primaryColor}` }}>
                              Education
                            </h3>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{data.education}</p>
                          </section>
                        </div>

                        {/* Right Col (Wide) - Exp & Summary */}
                        <div>
                          <section style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', color: templateConfig.primaryColor }}>
                              Summary
                            </h3>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.summary}</p>
                          </section>

                          <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.25rem', color: templateConfig.primaryColor }}>
                              Project Experience
                            </h3>
                            {data.experience.map((exp, i) => (
                              <div key={i} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: templateConfig.accentColor }}></div>
                                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{exp.role}</h4>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                                  {exp.company} [{exp.dates}]
                                </div>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', paddingLeft: '1rem', borderLeft: `2px solid ${templateConfig.accentColor}`, marginLeft: '0.25rem' }}>
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </section>
                        </div>

                      </div>
                    </div>
                  </div>
                  {/* --- END PDF CONTENT --- */}
                  
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