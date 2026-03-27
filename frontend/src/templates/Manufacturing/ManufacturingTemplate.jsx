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
  Hammer,
  Wrench,
  CheckCircle2,
  CheckCircle
} from 'lucide-react';

// Common Input Component
const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-700 transition-shadow"
    />
  </div>
);

export default function ManufacturingTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();

  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Manufacturing & Trades",
    primaryColor: "#B7410E", // Rust - Strength and Labor
    accentColor: "#2F4F4F",  // Dark Gray - Reliability
    defaultData: {
      firstName: "John",
      lastName: "Doe",
      title: "Certified Senior Welder",
      email: "john.welder@example.com",
      phone: "+1 555 3333",
      location: "Detroit, MI",
      summary: "Skilled Welder with 10+ years of experience in MIG, TIG, and Stick welding processes. Expert in blueprint reading, metal fabrication, and adhering to strict OSHA safety standards. Proven ability to deliver high-quality work under tight deadlines.",
      skills: "MIG/TIG Welding, Blueprint Reading, Metal Fabrication, OSHA Safety Compliance, Plasma Cutting, Quality Control, Forklift Operation",
      experience: [
        { role: "Lead Welder", company: "Heavy Metal Mfg", dates: "2015 - Present", description: "Supervise a team of 10 welders on the assembly line. Perform complex structural welds for heavy machinery. Reduced material waste by 15% through precision cutting techniques." }
      ],
      education: "Certified Welding Inspector (AWS) | Welding Technology Certificate, Lincoln Tech (2014)"
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
                  <Hammer className="w-4 h-4 text-white" />
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
                {generatedCvNumber || cvNumber ? "Update" : "Save"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all ${generatedCvNumber
                  ? "bg-slate-800 hover:bg-slate-900 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
              >
                <Download className="w-4 h-4 mr-2" /> Download
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
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-700" />
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
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Wrench className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills & Certifications</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-700" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-700" />
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
                <div ref={previewRef} className="h-full w-full bg-white text-slate-900">

                  {/* --- PDF CONTENT (MANUFACTURING FUNCTIONAL LAYOUT) --- */}
                  <div style={{ height: '100%', padding: '2.5rem', fontFamily: 'Arial, Helvetica, sans-serif', color: '#111827' }}>

                    {/* Header */}
                    <header style={{ borderBottom: `5px solid ${templateConfig.primaryColor}`, paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: '#1F2937', marginBottom: '0.25rem' }}>
                          {data.firstName}
                        </h1>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1', color: templateConfig.primaryColor }}>
                          {data.lastName}
                        </h1>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ backgroundColor: templateConfig.accentColor, color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                          {data.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4B5563' }}>
                          {data.location} | {data.phone}
                          <br />
                          {data.email}
                        </div>
                      </div>
                    </header>

                    {/* Summary Box */}
                    <section style={{ backgroundColor: '#F3F4F6', padding: '1.25rem', borderLeft: `6px solid ${templateConfig.primaryColor}`, marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#4B5563', marginBottom: '0.5rem' }}>Professional Summary</h3>
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{data.summary}</p>
                    </section>

                    {/* Main Layout Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '65% 30%', gap: '5%' }}>

                      {/* Left Column - Experience */}
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Experience
                        </h3>

                        {data.experience.map((exp, i) => (
                          <div key={i} style={{ marginBottom: '2rem', paddingLeft: '1rem', borderLeft: '2px solid #E5E7EB' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{exp.role}</h4>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: templateConfig.primaryColor, marginBottom: '0.5rem' }}>
                              {exp.company} <span style={{ color: '#9CA3AF' }}>|</span> {exp.dates}
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#374151' }}>
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Right Column - Skills & Certs */}
                      <div>
                        {/* Dark Sidebar Box */}
                        <div style={{ backgroundColor: templateConfig.accentColor, color: 'white', padding: '1.5rem', height: '100%' }}>

                          <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', color: '#FCD34D' }}>
                              Expertise
                            </h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                              {data.skills.split(',').map((skill, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: '1.3', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
                                  {skill.trim()}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', color: '#FCD34D' }}>
                              Certifications
                            </h3>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{data.education}</p>
                          </div>

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
                <Eye className="w-3 h-3" /> Preview Mode
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 text-center">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-[#B7410E]">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Finalized</h3>
            <p className="text-slate-500 text-sm mb-8 px-4 font-medium italic underline decoration-[#B7410E]/30 underline-offset-4 tracking-wide">
              Your professional manufacturing record has been synchronized and assigned a unique registration serial.
            </p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-[#B7410E] mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#B7410E] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Back to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}