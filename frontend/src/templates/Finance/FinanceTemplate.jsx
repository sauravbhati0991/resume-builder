import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  DollarSign,
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
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
    />
  </div>
);

export default function FinanceTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Finance & Accounting",
    primaryColor: "#228B22", // Forest Green - Stability and Wealth
    accentColor: "#D4AF37",  // Gold - Prosperity (Darkened for readability)
    defaultData: {
      firstName: "Michael",
      lastName: "Scott",
      title: "Senior Financial Analyst",
      email: "m.scott@finance.com",
      phone: "+1 555 1357",
      location: "New York, NY",
      summary: "Detail-oriented Senior Financial Analyst with 6+ years of experience in forecasting, budgeting, and data modeling. Proven track record of identifying cost-saving opportunities and driving profitability through strategic financial planning.",
      skills: "Financial Modeling, Advanced Excel (VBA/Macros), SQL, SAP, GAAP, Risk Management, Data Visualization (Tableau), Strategic Planning",
      experience: [
        { role: "Financial Analyst", company: "Wall Street Firm", dates: "2020 - Present", description: "Spearheaded the quarterly budgeting process for a $50M division. Developed automated financial models that reduced reporting time by 30%. Identified and executed cost-saving initiatives resulting in a 10% reduction in operating expenses." }
      ],
      education: "MBA Finance, Wharton (2018-2020) | BS Accounting, Penn State (2014-2018)"
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
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">{templateConfig.name} Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
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
                className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity ${generatedCvNumber
                  ? "bg-slate-800 hover:opacity-90"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
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
                  <h3>Executive Summary</h3>
                </div>
                <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Briefcase className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                    <h3>Professional Experience</h3>
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
                          <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experience')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Code className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills & Expertise</h3>
                </div>
                <textarea rows={3} value={data.skills} onChange={(e) => handleInputChange('skills', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
                <div id="resume-preview" ref={previewRef} className="h-full w-full bg-white">

                  {/* --- PDF CONTENT (CORPORATE LAYOUT) --- */}
                  <div style={{ height: '100%', padding: '3rem', fontFamily: 'Times New Roman, serif', color: '#111827' }}>

                    {/* Header */}
                    <header style={{ textAlign: 'center', borderBottom: '2px solid #374151', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', color: '#111827' }}>
                        {data.firstName} {data.lastName}
                      </h1>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '0.5rem' }}>
                        {data.title}
                      </p>
                      <div style={{ fontSize: '0.85rem', color: '#4B5563', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <span>{data.location}</span>
                        <span>|</span>
                        <span>{data.phone}</span>
                        <span>|</span>
                        <span>{data.email}</span>
                      </div>
                    </header>

                    {/* Executive Summary */}
                    <section style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '0.75rem', color: templateConfig.primaryColor }}>
                        Executive Summary
                      </h3>
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'justify' }}>
                        {data.summary}
                      </p>
                    </section>

                    {/* Professional Experience */}
                    <section style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '1rem', color: templateConfig.primaryColor }}>
                        Professional Experience
                      </h3>

                      {data.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1F2937' }}>{exp.company}</span>
                            <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#4B5563' }}>{exp.dates}</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: templateConfig.primaryColor, marginBottom: '0.5rem' }}>
                            {exp.role}
                          </div>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#374151' }}>
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </section>

                    {/* Bottom Grid for Skills and Education */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                      {/* Education */}
                      <section>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '0.75rem', color: templateConfig.primaryColor }}>
                          Education
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {data.education}
                        </p>
                      </section>

                      {/* Skills */}
                      <section>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', marginBottom: '0.75rem', color: templateConfig.primaryColor }}>
                          Skills & Expertise
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {data.skills}
                        </p>
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
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-b-8 border-green-600">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Record Saved</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium leading-tight">Your financial profile has been synchronized. CV Serial Number:</p>
            <div className="bg-slate-100 py-3 rounded-lg font-mono font-bold text-slate-900 mb-6 tracking-widest text-lg border border-dashed border-slate-300">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black uppercase shadow-lg hover:opacity-90 transition-all text-xs">
              Return to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}