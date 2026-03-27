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
  Microscope,
  FlaskConical,
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
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 transition-shadow"
    />
  </div>
);

export default function ScienceTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();

  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Science & Research",
    primaryColor: "#008080", // Teal - Knowledge and Discovery
    accentColor: "#2F4F4F",  // Dark Slate Gray - Depth and Seriousness
    defaultData: {
      firstName: "Marie",
      lastName: "Curie",
      title: "Senior Research Scientist",
      email: "marie.lab@example.com",
      phone: "+1 555 0000",
      location: "Cambridge, MA",
      summary: "Dedicated Research Scientist with 7+ years of experience in molecular biology and genomic sequencing. Skilled in designing experimental protocols, analyzing complex datasets using Python/R, and presenting findings in peer-reviewed journals. Committed to advancing drug discovery through rigorous experimentation.",
      skills: "PCR & qPCR, Gel Electrophoresis, CRISPR-Cas9, Data Analysis (R, Python), Flow Cytometry, Cell Culture, Grant Writing, Lab Safety Management",
      experience: [
        { role: "Lead Researcher", company: "BioGen Innovations", dates: "2019 - Present", description: "Lead a team of 5 technicians in studying gene therapy vectors. Reduced experimental error rates by 15% through protocol optimization. Published 3 papers in major scientific journals." }
      ],
      education: "PhD in Molecular Biology, MIT (2015-2019) | BS Biochemistry, UCLA (2011-2015)"
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
                  <Microscope className="w-4 h-4 text-white" />
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
                  <Save className="w-4 h-4 mr-2" />
                )}
                {generatedCvNumber || cvNumber ? "Update" : "Save"}
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
                  <h3>Research Summary</h3>
                </div>
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
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
                        <InputGroup label="Company/Lab" value={exp.company} onChange={(v) => handleArrayChange(index, 'company', v, 'experience')} />
                        <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(index, 'dates', v, 'experience')} className="md:col-span-2" />
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <FlaskConical className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills & Techniques</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
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
                <div id="resume-preview" ref={previewRef} className="h-full w-full bg-white font-sans">

                  {/* --- PDF CONTENT (LAB REPORT LAYOUT) --- */}
                  <div style={{ height: '100%', padding: '3rem', color: '#1e293b' }}>

                    {/* Header */}
                    <header style={{
                      borderBottom: `4px solid ${templateConfig.primaryColor}`,
                      paddingBottom: '1.5rem',
                      marginBottom: '2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>
                          {data.firstName} {data.lastName}
                        </h1>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500', color: templateConfig.primaryColor }}>
                          {data.title}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                        <div>{data.email}</div>
                        <div>{data.phone}</div>
                        <div>{data.location}</div>
                      </div>
                    </header>

                    {/* Summary (Abstract style) */}
                    <section style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem', borderLeft: `4px solid ${templateConfig.accentColor}` }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: templateConfig.primaryColor }}>
                        Research Profile
                      </h3>
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'justify', margin: 0 }}>
                        {data.summary}
                      </p>
                    </section>

                    {/* Experience Grid */}
                    <section style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#334155' }}>
                        Professional Experience
                      </h3>

                      {data.experience.map((exp, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '20% 75%', gap: '5%', marginBottom: '1.5rem' }}>
                          {/* Date Column */}
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: templateConfig.primaryColor, paddingTop: '0.2rem' }}>
                            {exp.dates}
                          </div>

                          {/* Details Column */}
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                            <div style={{ fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.5rem', color: '#475569' }}>
                              {exp.company}
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </section>

                    {/* Footer Grid (Skills & Education) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingTop: '1rem' }}>

                      {/* Skills */}
                      <section>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#334155' }}>
                          Techniques & Skills
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.skills}</p>
                      </section>

                      {/* Education */}
                      <section>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#334155' }}>
                          Education
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.education}</p>
                      </section>

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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-md text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8" style={{ borderColor: templateConfig.primaryColor }}>
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Record Synchronized</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-teal-600/30 underline-offset-4 tracking-wide text-slate-900">
              Your research profile has been synchronized with the global science registry.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 text-center">Experiment ID</p>
              <p className="text-3xl font-black text-teal-700 tracking-tighter text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest"
            >
              Return to Laboratory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}