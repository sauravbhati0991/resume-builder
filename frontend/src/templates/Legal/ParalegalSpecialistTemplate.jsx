import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft, Download, Plus, Trash2, Loader2, Save, Mail, Phone, MapPin, Search, FileText, BookOpen, CheckSquare,
  Database, ShieldCheck, AlertCircle, CheckCircle2
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00008B] transition-all shadow-sm font-medium text-slate-700"
    />
  </div>
);

export default function ParalegalSpecialistTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Paralegal Specialist",
    primaryColor: "#00008B",
    accentColor: "#F5F5DC",
    defaultData: {
      firstName: "Rachel",
      lastName: "Zane",
      title: "Senior Corporate Paralegal",
      email: "r.zane@lawfirm.com",
      phone: "+1 555 333 4444",
      location: "Boston, MA",
      summary: "Highly organized Paralegal Specialist with 10 years of experience supporting corporate litigation and real estate law. Expert in drafting pleadings, conducting exhaustive legal research via Westlaw, and managing complex discovery processes.",
      skills: "LexisNexis, Westlaw, Trial Preparation, Document Review, Pleadings & Motions, Relativity eDiscovery, Client Interviewing",
      experience: [
        { role: "Senior Paralegal", company: "Pearson Specter", dates: "2018 - Present", description: "Manage eDiscovery for class-action lawsuits involving over 50,000 documents. Draft deposition summaries, subpoenas, and legal memos for senior partners." },
        { role: "Legal Assistant", company: "Boston Legal Group", dates: "2013 - 2018", description: "Organized case files and maintained the firm's central docket. Assisted attorneys in court during 4 major civil trials." }
      ],
      education: "B.A. Pre-Law Studies, Boston University (2013)\nCertified Paralegal (CP) - NALA"
    }
  };

  // MASTER PATTERN STATE MANAGEMENT
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...data[arrayName]];
    newArray[index][field] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

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
    <div className="fixed inset-0 bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* CASE MANAGEMENT HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#00008B] p-2 rounded">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight text-xs uppercase tracking-widest">Case Management Console <span className="text-slate-400 font-normal ml-2">v4.0</span></h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border border-slate-200 hover:bg-slate-50 transition-all text-slate-700 bg-white shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {generatedCvNumber || cvNumber ? "Update" : "Save"}
          </button>
          <button
            onClick={() => handlePdfDownload(generatedCvNumber)}
            disabled={!generatedCvNumber}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 ${generatedCvNumber
              ? "bg-[#00008B] text-white hover:brightness-110"
              : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50"
              }`}
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* INPUT CONSOLE */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b pb-4">
              <CheckSquare size={16} className="text-blue-900" /> Essential Case Data
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
              <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
              <InputGroup label="Specialist Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
              <InputGroup label="Email Address" value={data.email} onChange={(v) => handleInputChange('email', v)} />
              <InputGroup label="Phone Line" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
              <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Narrative</h3>
            <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00008B] outline-none text-slate-600 bg-slate-50/50 shadow-inner font-medium" />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Litigation History</h3>
              <button onClick={addExperience} className="text-[10px] font-black text-blue-700 hover:underline tracking-widest uppercase">+ NEW CASE</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/30 relative group hover:bg-white hover:shadow-md transition-all">
                <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                  <InputGroup label="Firm/Entity" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                  <InputGroup label="Timeline" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                  <textarea rows={3} placeholder="Describe duties, tools used (LexisNexis), and case outcomes..." value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-1/2 bg-slate-200 flex justify-center overflow-y-auto p-12 custom-scrollbar rounded-3xl shadow-inner text-slate-800">
          <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.15)' }}>

            {/* Left Discovery Sidebar */}
            <div style={{ width: '35%', backgroundColor: templateConfig.accentColor, padding: '50px 35px', borderRight: `5px solid ${templateConfig.primaryColor}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '34px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', lineHeight: '1', marginBottom: '10px', letterSpacing: '-1px' }}>
                  {data.firstName}<br />{data.lastName}
                </h1>
                <div style={{ height: '3px', width: '40px', backgroundColor: templateConfig.primaryColor, marginBottom: '15px' }}></div>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</p>
              </div>

              <div style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} /> Contact
                </h3>
                <div style={{ fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: '600' }}>
                  <div style={{ borderBottom: '1px solid rgba(0,0,139,0.1)', paddingBottom: '5px' }}>{data.phone}</div>
                  <div style={{ borderBottom: '1px solid rgba(0,0,139,0.1)', paddingBottom: '5px', wordBreak: 'break-all' }}>{data.email}</div>
                  <div>{data.location}</div>
                </div>
              </div>

              <div style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={14} /> Technical Stack
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.skills.split(',').map((skill, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#1e293b', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.5)', padding: '6px 10px', borderRadius: '4px' }}>
                      {skill.trim()}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} /> Credentials
                </h3>
                <p style={{ fontSize: '11px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{ width: '65%', padding: '50px 50px' }}>
              <section style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Executive Summary</h3>
                <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#1e293b', textAlign: 'justify', fontWeight: '500' }}>{data.summary}</p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Professional Record</h3>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '35px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                      <span style={{ fontSize: '10px', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                    <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#334155', margin: 0 }}>{exp.description}</p>
                  </div>
                ))}
              </section>
            </div>

            {/* SERVER SYNCED FOOTER */}
            {generatedCvNumber && (
              <div style={{ position: 'absolute', bottom: '20px', right: '30px', fontSize: '9px', color: '#cbd5e1', fontWeight: 'bold', pointerEvents: 'none', fontFamily: 'monospace' }}>
                AUDIT_REF: {generatedCvNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-t-8 border-indigo-900">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Success</h3>
            <p className="text-slate-500 text-sm mb-8 px-4 font-medium italic underline decoration-indigo-900/30 underline-offset-4 tracking-wide">
              Your professional case history has been locked and assigned a verified record ID.
            </p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-blue-900 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#00008B] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Close Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}