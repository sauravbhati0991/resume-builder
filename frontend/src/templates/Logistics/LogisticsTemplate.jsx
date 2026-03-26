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
  Truck,
  Package,
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
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-shadow"
    />
  </div>
);

export default function LogisticsTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Logistics",
    primaryColor: "#808000", // Olive Green - Stability and Efficiency
    accentColor: "#DAA520",  // Goldenrod (Darker yellow for text visibility)
    defaultData: {
      firstName: "Tom",
      lastName: "Hanks",
      title: "Supply Chain Analyst",
      email: "tom.logistics@example.com",
      phone: "+1 555 9999",
      location: "Memphis, TN",
      summary: "Efficient Supply Chain Analyst skilled in inventory management, route optimization, and vendor relations. Proven track record of reducing shipping costs and improving delivery times through data-driven strategies.",
      skills: "SAP ERP, Logistics Management, Data Analysis (Excel/SQL), Inventory Control, Route Optimization, Vendor Negotiation, Six Sigma Green Belt",
      experience: [
        { role: "Logistics Coordinator", company: "Global Shipping Co", dates: "2020 - Present", description: "Managed daily logistics operations for 50+ routes. Reduced shipping costs by 15% through route optimization algorithms. Coordinated with warehouse staff to ensure 99% inventory accuracy." }
      ],
      education: "BS Supply Chain Management, Michigan State University (2016-2020)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

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
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">{templateConfig.name} Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2 text-indigo-600" />
                )}
                {generatedCvNumber || cvNumber ? "Update_Registry" : "Save_Draft"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all ${generatedCvNumber
                  ? "bg-slate-800 hover:bg-slate-900 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
              >
                <Download className="w-4 h-4 mr-2" /> PDF_EXPORT
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
                  <h3>Summary</h3>
                </div>
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600" />
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
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Package className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600" />
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
                id="resume-preview"
                className="shadow-2xl transition-transform duration-200 bg-white"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  width: '210mm', 
                  minHeight: '297mm',
                }}
              >
                <div ref={previewRef} className="h-full w-full bg-slate-50 font-sans text-slate-800">
                  
                  {/* --- PDF CONTENT (LOGISTICS TIMELINE LAYOUT) --- */}
                  <div style={{ height: '100%', padding: '2.5rem', color: '#1f2937' }}>
                    
                    {/* Header */}
                    <header style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end', 
                      borderBottom: '4px solid #1f2937', 
                      paddingBottom: '1rem', 
                      marginBottom: '2rem' 
                    }}>
                      <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: '#1f2937' }}>
                          {data.firstName}
                        </h1>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: '#6b7280' }}>
                          {data.lastName}
                        </h1>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: templateConfig.primaryColor, marginBottom: '0.25rem' }}>
                          {data.title}
                        </p>
                        <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#4b5563' }}>
                          {data.location} | {data.phone}
                          <br/>
                          {data.email}
                        </p>
                      </div>
                    </header>

                    {/* Main Layout Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '30% 65%', gap: '5%' }}>
                      
                      {/* Left Column (Sidebar) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Skills */}
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderLeft: `4px solid ${templateConfig.primaryColor}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', color: '#374151' }}>
                            Skills
                          </h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {data.skills.split(',').map((s, i) => (
                              <span key={i} style={{ 
                                fontSize: '0.75rem', 
                                backgroundColor: '#f3f4f6', 
                                padding: '0.2rem 0.4rem', 
                                borderRadius: '0.25rem', 
                                border: '1px solid #e5e7eb' 
                              }}>
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Education */}
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderLeft: `4px solid ${templateConfig.accentColor}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem', color: '#374151' }}>
                            Education
                          </h3>
                          <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{data.education}</p>
                        </div>

                      </div>

                      {/* Right Column (Main) */}
                      <div>
                        {/* Profile */}
                        <section style={{ marginBottom: '2rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                            <span style={{ width: '0.5rem', height: '2rem', backgroundColor: templateConfig.primaryColor, display: 'inline-block' }}></span>
                            Profile
                          </h3>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#374151' }}>{data.summary}</p>
                        </section>

                        {/* Timeline Experience */}
                        <section>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                            <span style={{ width: '0.5rem', height: '2rem', backgroundColor: templateConfig.primaryColor, display: 'inline-block' }}></span>
                            History
                          </h3>
                          
                          <div style={{ borderLeft: '2px solid #d1d5db', marginLeft: '0.5rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {data.experience.map((exp, i) => (
                              <div key={i} style={{ position: 'relative' }}>
                                {/* Timeline Dot */}
                                <div style={{ 
                                  position: 'absolute', 
                                  left: '-1.95rem', 
                                  top: '0.25rem', 
                                  width: '1rem', 
                                  height: '1rem', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#1f2937', 
                                  border: '2px solid white' 
                                }}></div>
                                
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{exp.role}</h4>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 'bold', 
                                  backgroundColor: '#e5e7eb', 
                                  display: 'inline-block', 
                                  padding: '0.2rem 0.5rem', 
                                  borderRadius: '0.25rem', 
                                  marginTop: '0.25rem',
                                  marginBottom: '0.5rem',
                                  color: '#374151'
                                }}>
                                  {exp.dates} | {exp.company}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5', margin: 0 }}>{exp.description}</p>
                              </div>
                            ))}
                          </div>
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
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 text-center">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-[#808000]">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Finalized</h3>
            <p className="text-slate-500 text-sm mb-8 px-4 font-medium italic underline decoration-[#808000]/30 underline-offset-4 tracking-wide">
              Your professional logistics record has been synchronized and assigned a unique registration serial.
            </p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-[#808000] mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#808000] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Back to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}