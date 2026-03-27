import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft, Download, Plus, Trash2, Loader2, Save, Gavel, Scale, Award, BookOpen, UserCheck, ScrollText,
  Database, ShieldCheck, CheckCircle2, AlertCircle, FileLock
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b-2 border-slate-200 bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-[#00008B] transition-colors font-medium text-slate-700"
    />
  </div>
);

export default function TrialAttorneyProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Trial Attorney Pro",
    primaryColor: "#00008B",
    accentColor: "#F5F5DC",
    defaultData: {
      firstName: "Jessica",
      lastName: "Pearson",
      title: "Lead Trial Attorney",
      email: "j.pearson@litigation.com",
      phone: "+1 555 888 2222",
      location: "Washington, D.C.",
      summary: "Accomplished Trial Attorney with over 15 years of courtroom experience in complex civil litigation. Dedicated advocate known for delivering compelling opening/closing statements, aggressive cross-examinations, and securing highly favorable verdicts for corporate clients.",
      skills: "Civil Litigation, Cross-Examination, Depositions, Dispute Resolution, Appellate Practice, Legal Strategy, Mediation",
      experience: [
        { role: "Partner / Lead Litigator", company: "Pearson Legal Group", dates: "2016 - Present", description: "Serve as first-chair counsel in over 30 jury trials. Secured a landmark $45M defense verdict in a corporate fraud case. Supervise trial preparation and mock juries." },
        { role: "Associate Attorney", company: "State Prosecution Office", dates: "2009 - 2016", description: "Prosecuted white-collar crimes. Conducted over 100 depositions and drafted appellate briefs." }
      ],
      education: "Juris Doctor (J.D.), Georgetown University (2009)\nB.A. English, Stanford University (2006)"
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
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* ATTORNEY BAR HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <Gavel size={22} className="text-[#00008B]" />
            <h2 className="font-serif font-bold text-slate-900 tracking-tight text-lg italic">Attorney Pro Console <span className="text-slate-400 font-sans text-xs font-normal not-italic ml-2">v4.0</span></h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded border-2 border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-700 bg-white shadow-sm"
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
            className={`flex items-center gap-2 px-8 py-2 rounded font-bold text-[10px] uppercase tracking-[0.15em] shadow-lg transition-all active:scale-95 ${generatedCvNumber
              ? "bg-[#00008B] text-white hover:brightness-110"
              : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50"
              }`}
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full overflow-hidden flex gap-8">
        {/* LITIGATION INPUTS */}
        <div className="w-[45%] overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-32">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b pb-4">
              <UserCheck size={18} className="text-[#00008B]" /> Practitioner Identity
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
              <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
              <InputGroup label="Trial Designation" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
              <InputGroup label="Professional Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
              <InputGroup label="Direct Dial" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
              <InputGroup label="Office Locale" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Litigation Summary</h3>
            <textarea rows={5} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border-l-4 border-[#00008B] bg-slate-50 p-4 text-sm focus:outline-none text-slate-700 italic font-serif leading-relaxed shadow-inner font-medium" />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trial History</h3>
              <button onClick={addExperience} className="text-[10px] font-black text-[#00008B] border-b-2 border-[#00008B] uppercase tracking-widest">+ ADD PROCEEDING</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-10 relative group border-b border-slate-100 pb-8 hover:bg-slate-50/50 transition-colors px-4 pt-4 rounded-lg">
                <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="Position" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                  <InputGroup label="Law Firm / Agency" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                  <InputGroup label="Period of Counsel" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                  <textarea rows={3} placeholder="Highlight jury wins, major settlements, or first-chair responsibilities..." value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border-slate-200 border rounded-lg p-4 text-sm text-slate-600 font-serif leading-relaxed focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COURT PREVIEW */}
        <div className="w-[55%] flex justify-center overflow-y-auto custom-scrollbar bg-slate-300/40 rounded-3xl p-10 shadow-inner text-slate-800">
          <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontFamily: '"Georgia", serif' }}>

            {/* Centered Formal Header */}
            <div style={{ textAlign: 'center', padding: '60px 60px 30px', borderBottom: `1px solid rgba(0,0,139,0.2)`, margin: '0 50px' }}>
              <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>
                {data.firstName} {data.lastName}
              </h1>
              <h2 style={{ fontSize: '14px', color: '#111', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>{data.title}</h2>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '11px', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span>{data.email}</span>
                <span style={{ color: templateConfig.primaryColor }}>•</span>
                <span>{data.phone}</span>
                <span style={{ color: templateConfig.primaryColor }}>•</span>
                <span>{data.location}</span>
              </div>
            </div>

            <div style={{ padding: '45px 75px', flex: 1 }}>
              <section style={{ marginBottom: '45px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Professional Overview</h3>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.9', color: '#111', textAlign: 'justify', fontStyle: 'italic' }}>{data.summary}</p>
              </section>

              <section style={{ marginBottom: '45px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Trial Experience</h3>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                </div>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '35px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.company}</h4>
                      <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontStyle: 'italic', marginBottom: '12px', fontWeight: 'bold' }}>{exp.role}</div>
                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#222', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                  </div>
                ))}
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
                <section>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>Admissions & Skills</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.9', color: '#111', fontStyle: 'italic' }}>{data.skills}</p>
                </section>
                <section>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>Education</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#111', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{data.education}</p>
                </section>
              </div>
            </div>

            {/* ARCHIVE FOOTER */}
            {generatedCvNumber && (
              <div style={{ position: 'absolute', bottom: '25px', left: '0', right: '0', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#aaa', fontStyle: 'italic', marginBottom: '5px' }}>Document Authenticated via Court Record Repository</div>
                <div style={{ fontSize: '8px', color: '#bbb', fontFamily: 'monospace', fontWeight: 'bold' }}>VERIFIED_CASE_RECORD: {generatedCvNumber}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl border-t-8 border-indigo-900">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Finalized</h3>
            <p className="text-slate-500 text-sm mb-8 px-4 font-medium italic underline decoration-indigo-800/20 underline-offset-4 tracking-wide">
              Your litigation record has been authenticated and stored with a unique Case ID.
            </p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-blue-900 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#00008B] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Exit Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}