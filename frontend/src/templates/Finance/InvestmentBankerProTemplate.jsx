import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, Landmark, Briefcase, GraduationCap, PenTool, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-[0.1em]">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all font-medium text-slate-800"
    />
  </div>
);

export default function InvestmentBankerProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Investment Banker Pro",
    primaryColor: "#001f3f", // Navy Blue (Institutional)
    accentColor: "#d4af37",  // Metallic Gold
    defaultData: {
      firstName: "William",
      lastName: "Prescott",
      title: "Vice President, Investment Banking",
      email: "w.prescott@finance.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      summary: "Results-driven Investment Banker with 8+ years of experience in M&A advisory, capital raising, and corporate restructuring. Executed over $2B in transaction volume across the technology and healthcare sectors. Expert in complex financial modeling and strategic valuation.",
      skills: "Financial Modeling (LBO, DCF, M&A), Valuation Analysis, Due Diligence, Capital Markets, Bloomberg Terminal, FactSet, SQL",
      experience: [
        { role: "Vice President, M&A", company: "Goldman & Partners", dates: "2019 - Present", description: "Lead deal execution for sell-side M&A transactions. Supervise and mentor a team of 4 associates and analysts. Closed a $500M cross-border acquisition in Q3 2022, managing the entire valuation process and board presentations." },
        { role: "Investment Banking Associate", company: "Capital Markets LLC", dates: "2015 - 2019", description: "Built complex 3-statement financial models and prepared comprehensive pitchbooks for tech sector clients. Conducted rigorous financial due diligence for 3 successful IPOs." }
      ],
      education: "MBA in Finance, Wharton School of Business (2015)\nB.S. in Economics, NYU (2011)"
    }
  };

  // MASTER PATTERN STATE
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
    <div className="min-h-screen w-full bg-slate-200 flex flex-col overflow-hidden font-sans text-slate-900">

      {/* INSTITUTIONAL HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-[#001f3f] shadow-2xl rounded-lg p-4 flex justify-between items-center border-b-4 border-[#d4af37]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/templates')} className="text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 h-9 px-4 uppercase rounded flex items-center transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_SESSION
            </button>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#d4af37]" />
              <span className="font-bold text-sm text-white uppercase tracking-[0.2em]">{templateConfig.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-[10px] font-bold h-9 px-4 rounded bg-white/10 text-white hover:bg-white/20 transition-all uppercase flex items-center"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}

              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`text-[10px] font-black h-9 px-6 rounded text-blue-950 transition-all uppercase tracking-widest flex items-center shadow-lg ${generatedCvNumber
                ? "bg-[#d4af37] hover:bg-[#c4a137]"
                : "bg-slate-400 cursor-not-allowed opacity-70"
                }`}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-6">

          {/* INPUTS */}
          <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
              <h3 className="text-xs font-black mb-6 text-slate-900 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Identity & Contact</h3>
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Official Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Secure Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Direct Line" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Office Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
              <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Professional Mandate</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none mt-2" />
            </div>

            <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Transaction & Work History</h3>
                <button onClick={addExperience} className="text-[10px] bg-blue-900 text-white px-3 py-1 font-bold rounded uppercase hover:bg-blue-800 transition-colors">+ New Entry</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-6 p-6 rounded bg-slate-50 relative group border border-slate-200">
                  <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Seniority/Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Financial Institution" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Tenure" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={4} placeholder="Closed deals, deal size, sector focus, and modeling expertise..." value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-3 text-sm mt-1 outline-none focus:border-blue-900 bg-white" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
              <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2 flex items-center gap-2"><PenTool className="w-4 h-4" /> Technical Arsenal</h3>
              <InputGroup label="Core Skills (M&A, DCF, LBO...)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-6"></div>
              <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Credentials</h3>
              <textarea rows={3} value={data.education} onChange={(e) => handleInputChange('education', e.target.value)} className="w-full border rounded p-3 text-sm focus:border-blue-900 outline-none" />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-600 flex justify-center p-12 overflow-auto custom-scrollbar shadow-inner">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '60px 80px', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', flexDirection: 'column' }}>

              <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '15px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px', lineHeight: '1' }}>
                  {data.firstName} {data.lastName}
                </h1>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                  {data.location} • {data.phone} • {data.email}
                </p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontSize: '12px', lineHeight: '1.5', textAlign: 'justify', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  {data.summary}
                </p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                  Professional Experience
                </h3>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{exp.company}</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '6px' }}>{exp.role}</div>
                    <p style={{ fontSize: '12px', lineHeight: '1.4', textAlign: 'justify', margin: 0 }}>{exp.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                  Education
                </h3>
                <p style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                  Skills & Additional Information
                </h3>
                <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                  <strong>Technical Proficiencies:</strong> {data.skills}
                </p>
              </div>

              {generatedCvNumber && (
                <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                  <div style={{ height: '1px', background: '#f1f1f1', marginBottom: '10px' }}></div>
                  <span style={{ fontSize: '9px', color: '#ccc', letterSpacing: '2px' }}>DOCUMENT_REF: {generatedCvNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/90 backdrop-blur-md px-4 text-center">
          <div className="bg-white rounded-lg p-10 max-w-sm w-full shadow-2xl border-t-8 border-[#d4af37]">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight font-serif">Credential Secured</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-[#d4af37]/30 underline-offset-4 tracking-wide">
              Transaction history successfully serialized and archived to the primary ledger.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Audit Reference</p>
              <p className="text-3xl font-black text-blue-900 tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-blue-900 text-white font-bold uppercase shadow-xl hover:bg-blue-950 transition-all text-xs tracking-widest"
            >
              Back to Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}