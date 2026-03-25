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
  Palette
} from 'lucide-react';

// Common Input Component
const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
    />
  </div>
);

export default function CreativeTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Creative & Media",
    primaryColor: "#800080", // Purple
    accentColor: "#D4D400",  // Darker Yellow (for better readability than pure #FFFF00)
    defaultData: {
      firstName: "Alice",
      lastName: "Wonder",
      title: "Senior Graphic Designer",
      email: "alice.design@example.com",
      phone: "+1 555 2468",
      location: "Portland, OR",
      summary: "Creative Graphic Designer with a unique eye for branding, digital illustration, and visual storytelling. Over 6 years of experience transforming complex ideas into compelling visual narratives for global brands.",
      skills: "Adobe Creative Suite, UI/UX Design, Typography, Branding & Identity, Motion Graphics, Figma, Prototyping",
      experience: [
        { role: "Senior Designer", company: "Creative Agency", dates: "2019 - Present", description: "Led rebranding campaigns for 3 major national clients. Managed a team of 4 junior designers and oversaw print and digital production." }
      ],
      education: "BFA Graphic Design, RISD (2015-2019)"
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
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">{templateConfig.name} Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
              </button>
              <button onClick={downloadPDF} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity hover:opacity-90" style={{ backgroundColor: templateConfig.primaryColor }}>
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
                  <h3>Creative Bio</h3>
                </div>
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>

          {/* --- RIGHT: Preview --- */}
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
                <div ref={previewRef} className="h-full w-full bg-white relative overflow-hidden font-sans">
                  
                  {/* --- PDF CONTENT (CREATIVE LAYOUT) --- */}
                  
                  {/* Background Shapes (Using z-index 0 to stay behind content) */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', borderBottomLeftRadius: '100%', backgroundColor: templateConfig.primaryColor, opacity: 0.1, zIndex: 0 }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '250px', height: '250px', borderTopRightRadius: '100%', backgroundColor: templateConfig.accentColor, opacity: 0.2, zIndex: 0 }}></div>

                  <div style={{ position: 'relative', zIndex: 10, padding: '3rem' }}>
                    
                    {/* Header */}
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid black', paddingBottom: '1.5rem', marginBottom: '3rem' }}>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '1.25rem', fontStyle: 'italic', marginBottom: '0.5rem', color: templateConfig.primaryColor }}>Hello, I am</p>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.05em', color: '#1e293b' }}>
                          {data.firstName}
                        </h1>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.05em', color: templateConfig.primaryColor }}>
                          {data.lastName}
                        </h1>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', lineHeight: '1.6', color: '#334155' }}>
                        <p>{data.title}</p>
                        <p>{data.email}</p>
                        <p>{data.phone}</p>
                        <p>{data.location}</p>
                      </div>
                    </header>

                    {/* Content Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '30% 65%', gap: '5%' }}>
                      
                      {/* Left Column (Skills & Ed) */}
                      <div>
                        {/* Rotated Skills Box */}
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: '1.5rem', 
                          borderRadius: '0.5rem', 
                          marginBottom: '2rem', 
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          transform: 'rotate(-2deg)', // Subtle rotation for effect
                          border: `1px solid ${templateConfig.accentColor}`
                        }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1rem', color: templateConfig.primaryColor }}>My Skills</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {data.skills.split(',').map((s, i) => (
                              <span key={i} style={{ 
                                padding: '0.25rem 0.75rem', 
                                border: '2px solid black', 
                                borderRadius: '9999px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold', 
                                backgroundColor: 'white',
                                display: 'inline-block'
                              }}>
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.5rem', color: '#1e293b' }}>Education</h3>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.4' }}>{data.education}</p>
                        </div>
                      </div>

                      {/* Right Column (About & Exp) */}
                      <div>
                        <section style={{ marginBottom: '2.5rem' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: templateConfig.primaryColor }}>
                            About Me
                          </h3>
                          <p style={{ fontSize: '1rem', lineHeight: '1.6', fontWeight: '300', color: '#334155' }}>{data.summary}</p>
                        </section>

                        <section>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>Experience</h3>
                          {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '2rem', borderLeft: `4px solid ${templateConfig.accentColor}`, paddingLeft: '1.5rem' }}>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{exp.role}</h4>
                              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '0.5rem' }}>{exp.company} / {exp.dates}</p>
                              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>{exp.description}</p>
                            </div>
                          ))}
                        </section>
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