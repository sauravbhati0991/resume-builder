import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Award, Shield, Database, Briefcase, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function CaEliteTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "CA Elite",
    primaryColor: "#14532d", // Deep Forest Green
    accentColor: "#fbbf24",  // Amber Gold
    defaultData: {
      firstName: "Neha",
      lastName: "Sharma",
      title: "Chartered Accountant (CA)",
      email: "neha.sharma@ca-firm.com",
      phone: "+91 98765 43210",
      location: "Mumbai, India",
      summary: "Highly meticulous Chartered Accountant with 7 years of post-qualification experience in statutory auditing, corporate taxation, and financial compliance. Expert in navigating complex tax frameworks and advising corporations on financial restructuring.",
      skills: "Statutory Audit, Direct & Indirect Tax, IFRS/Ind AS, Financial Restructuring, SAP ERP, Advanced Excel, Risk Assessment",
      experience: [
        { role: "Senior Audit Manager", company: "KPMG Solutions", dates: "2020 - Present", description: "Manage statutory audits for 10+ publicly listed companies. Identified compliance gaps that saved clients over ₹1.5 Cr in potential penalties and optimized tax workflows." },
        { role: "Tax Consultant", company: "Deloitte India", dates: "2017 - 2020", description: "Prepared corporate tax returns and handled scrutiny assessments. Advised clients on GST implementation strategies and cross-border taxation." }
      ],
      education: "Chartered Accountant (ICAI), All India Rank 45 (2017)\nB.Com, Mumbai University (2014)"
    }
  };

  // MASTER PATTERN STATE
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // Quick Draft Sync
  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`ca_elite_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER LOGIC: Handshake -> High-Scale Render -> Binary Archive -> Download
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified API Handshake
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Finance & Taxation",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. Scale-3 Professional Rendering
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `CA_ELITE_${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { 
            scale: 3, 
            useCORS: true, 
            letterRendering: true,
            scrollX: 0,
            scrollY: -window.scrollY
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      // 3. Blob Archival via FormData
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Client Trigger & State Update
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("CA Archival Error:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = () => setShowReplaceModal(true);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* PROFESSIONAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-b-4 border-green-800 shadow-md rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase border rounded flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_BUILDER
                </button>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-800" />
                  <span className="font-black text-sm uppercase tracking-tighter">{templateConfig.name} Profile</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} SECURE_DRAFT
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-black h-9 px-6 rounded bg-green-900 text-white hover:bg-green-950 transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} EXPORT_CERTIFIED_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-4">
            
            {/* INPUT SECTION */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-green-800 uppercase tracking-widest border-b pb-2">Profile Credentials</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Given Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Surname" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Chartered Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Professional Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact Number" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Jurisdiction/Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-green-800 border-b pb-2">Professional Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-green-800 focus:outline-none mt-2"/>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-green-800">Experience Ledger</h3>
                        <button onClick={addExperience} className="text-[10px] bg-green-800 text-white px-3 py-1 font-bold rounded uppercase">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded-lg border-2 border-slate-50 bg-white relative group shadow-sm">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Firm / Corporation" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Tenure Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Key audits, tax filings, and leadership responsibilities..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-3 text-sm mt-1 outline-none focus:border-green-800"/>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* PREVIEW SECTION */}
            <div className="h-full bg-slate-400 flex justify-center p-8 overflow-auto custom-scrollbar shadow-inner rounded-xl">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex' }}>
                    
                    <div style={{ width: '38%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '60px 40px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase', marginBottom: '10px' }}>
                                {data.firstName}<br/><span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ height: '4px', width: '40px', backgroundColor: templateConfig.accentColor, marginBottom: '15px' }}></div>
                            <p style={{ fontSize: '12px', color: templateConfig.accentColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Direct Contact</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '15px', color: '#ecfdf5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={14} color={templateConfig.accentColor}/> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Phone size={14} color={templateConfig.accentColor}/> {data.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={14} color={templateConfig.accentColor}/> {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Audit & Expertise</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', color: '#ecfdf5', display: 'flex', gap: '10px', alignItems: 'flex-start', fontWeight: '500' }}>
                                        <div style={{ marginTop: '5px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: templateConfig.accentColor }}></div>
                                        <span style={{ lineHeight: '1.4' }}>{skill.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Education</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.8', color: '#ecfdf5', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                        </div>
                    </div>

                    <div style={{ width: '62%', padding: '60px 50px', display: 'flex', flexDirection: 'column' }}>
                        
                        <section style={{ marginBottom: '50px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Award size={20} color={templateConfig.primaryColor} />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', margin: 0 }}>Executive Profile</h3>
                            </div>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#334155', fontWeight: '500' }}>{data.summary}</p>
                        </section>

                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <Briefcase size={20} color={templateConfig.primaryColor} />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', margin: 0 }}>Professional Ledger</h3>
                            </div>
                            
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative', borderLeft: `2px solid #e2e8f0`, paddingLeft: '25px' }}>
                                    <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: templateConfig.primaryColor }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        {generatedCvNumber && (
                            <div style={{ marginTop: 'auto', textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#cbd5e1', letterSpacing: '1px' }}>CERTIFIED_RECORD_ID: {generatedCvNumber}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Certify and Export?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">By proceeding, you will archive this profile in the professional registry and generate a high-scale certified PDF.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDownloadProcess} disabled={isDownloading} className="w-full py-4 rounded bg-green-900 text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-xs">
                {isDownloading ? "Certifying..." : "Confirm & Archive"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-4 rounded border-2 border-slate-100 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-12 max-w-sm w-full text-center shadow-2xl border-t-[10px] border-amber-400">
            <div className="w-20 h-20 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter">Profile Secured</h3>
            <p className="text-xs text-slate-400 mb-8 font-semibold tracking-widest uppercase">Registry Entry:</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-green-900 mb-8 tracking-widest text-lg border border-slate-100">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest bg-green-900">
              Return to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}