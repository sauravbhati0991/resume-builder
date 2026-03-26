import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, Mail, Phone, MapPin, FileText, CheckCircle2, Database, Shield } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function TaxConsultantPortfolioTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Tax Consultant Portfolio",
    primaryColor: "#064e3b", // Deep Emerald
    accentColor: "#fbbf24",  // Amber Gold
    defaultData: {
      firstName: "Sarah",
      lastName: "Levine",
      title: "Senior Tax Consultant (CPA)",
      email: "sarah.tax@consulting.com",
      phone: "+1 555 333 2222",
      location: "Dallas, TX",
      summary: "Strategic Tax Consultant with deep expertise in corporate tax planning, compliance, and international tax structuring. Proven ability to minimize tax liabilities and ensure strict adherence to federal and state tax codes for multinational clients.",
      skills: "Corporate Tax Strategy, Transfer Pricing, Tax Provision (ASC 740), IRS Audit Defense, Compliance, ERP Systems, Multi-State Filings",
      experience: [
        { role: "Senior Tax Consultant", company: "PwC", dates: "2019 - Present", description: "Advise Fortune 500 clients on tax implications of M&A transactions. Led a tax restructuring project that resulted in $4M annual tax savings for a tech client. Represented clients in complex IRS negotiations." },
        { role: "Tax Analyst", company: "BDO USA", dates: "2016 - 2019", description: "Prepared federal and multi-state tax returns for middle-market corporations. Assisted in representing clients during IRS audit inquiries and state tax nexus studies." }
      ],
      education: "Master of Taxation (MTax), University of Texas (2016)\nB.S. in Accounting (2014)"
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* ADVISORY TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-md rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-3 rounded-md border flex items-center uppercase transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return
                </button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-900" />
                  <span className="font-bold text-sm uppercase tracking-tighter">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-bold h-9 px-4 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center uppercase"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}

                {generatedCvNumber || cvNumber ? "UPDATE_SYNC" : "SAVE_DRAFT"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`text-xs font-black h-9 px-6 rounded-md text-white shadow-lg transition-all flex items-center uppercase tracking-widest ${generatedCvNumber
                  ? "hover:opacity-90"
                  : "bg-slate-300 cursor-not-allowed opacity-70"
                  }`}
                style={{
                  backgroundColor: generatedCvNumber
                    ? templateConfig.primaryColor
                    : undefined
                }}
              >
                <Download className="w-4 h-4 mr-2" /> EXPORT_CONSULTANT_PDF
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0 mt-4">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-emerald-900 flex items-center gap-2 border-b pb-2"><FileText size={16}/> Consultant Identity</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Title & Credentials" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Official Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Office Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-emerald-900 border-b pb-2">Advisory Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-lg text-sm font-medium focus:ring-1 focus:ring-emerald-700"/>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900">Engagement History</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold text-emerald-700 uppercase">+ New Engagement</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Consulting Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Firm Name" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Period" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={4} placeholder="Key tax projects, ROI for clients, compliance successes..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded-lg p-3 text-sm focus:border-emerald-700 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-emerald-900 border-b pb-2">Technical Competencies</h3>
                    <InputGroup label="Tax Skills (e.g., Transfer Pricing, ASC 740)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic & Certifications" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-300 rounded-2xl overflow-auto flex justify-center p-10 custom-scrollbar shadow-inner">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '50px 60px', borderBottom: `6px solid ${templateConfig.accentColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: '0.9', marginBottom: '8px' }}>
                                {data.firstName} <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <h2 style={{ fontSize: '15px', color: templateConfig.accentColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px' }}>{data.title}</h2>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>{data.email} <Mail size={12}/></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>{data.phone} <Phone size={12}/></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.location} <MapPin size={12}/></div>
                        </div>
                    </div>

                    <div style={{ padding: '50px 60px', flex: 1, display: 'flex', gap: '50px' }}>
                        <div style={{ flex: 1.8 }}>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '20px' }}>Advisory Profile</h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#334155', fontWeight: '500' }}>{data.summary}</p>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '25px' }}>Consulting Engagements</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>

                        <div style={{ flex: 1 }}>
                            <section style={{ marginBottom: '40px', backgroundColor: '#f8fafc', padding: '25px', borderRadius: '8px', borderLeft: `5px solid ${templateConfig.accentColor}` }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '18px' }}>Technical Core</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#1e293b', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <CheckCircle2 size={12} color={templateConfig.primaryColor}/> {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '8px', borderLeft: `5px solid ${templateConfig.accentColor}` }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Credentials</h3>
                                <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </section>

                            {generatedCvNumber && (
                                <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', opacity: 0.5 }}>
                                    <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '2px', color: '#64748b' }}>CONSULTANT_INDEX: {generatedCvNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ height: '8px', background: `linear-gradient(to right, ${templateConfig.primaryColor}, ${templateConfig.accentColor})` }}></div>
                </div>
            </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-emerald-600">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Record Secured</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-emerald-600/30 underline-offset-4 tracking-wide">
              Tax advisory documentation successfully filed and secured in the advisory registry.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 text-center">Index Reference</p>
              <p className="text-3xl font-black text-emerald-700 tracking-tighter text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}