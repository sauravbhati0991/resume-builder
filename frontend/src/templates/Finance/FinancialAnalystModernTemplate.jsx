import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, BarChart3, PieChart, Database, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium" 
    />
  </div>
);

export default function FinancialAnalystModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Financial Analyst Modern",
    primaryColor: "#064e3b", // Emerald 900
    accentColor: "#fbbf24",  // Amber 400
    defaultData: {
      firstName: "Alex",
      lastName: "Russo",
      title: "Senior Financial Analyst",
      email: "alex.russo@analytics.com",
      phone: "+1 555 444 3333",
      location: "San Francisco, CA",
      summary: "Detail-oriented Financial Analyst with 5 years of experience in corporate FP&A. Skilled in financial modeling, variance analysis, and developing Tableau dashboards that drive actionable business insights.",
      skills: "FP&A, Financial Modeling, Tableau, SQL, Advanced Excel, Variance Analysis, Forecasting, DCF, Python",
      experience: [
        { role: "Senior Financial Analyst", company: "TechNova Inc.", dates: "2021 - Present", description: "Manage the $50M annual operating budget. Developed automated financial dashboards in Tableau, reducing month-end reporting time by 3 days and improving forecast accuracy by 15%." },
        { role: "Financial Analyst", company: "Venture Partners", dates: "2018 - 2021", description: "Created complex DCF models to evaluate potential acquisitions totaling $200M+. Assisted in quarterly earnings presentations for the Board and streamlined data collection from 5 business units." }
      ],
      education: "B.S. in Finance, UC Berkeley (2018)\nCFA Level II Candidate"
    }
  };

  // MASTER PATTERN STATE
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  // Quick Sync (Draft)
  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`fin_analyst_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER DOWNLOAD FLOW
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified Handshake
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Finance & Analytics",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;
      setGeneratedCvNumber(cvNumber);

      // 2. High-Scale Rendering (Scale 3 + UI Fixes)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `FIN_REPORT_${cvNumber}.pdf`,
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

      // 3. FormData Archival (Binary Upload)
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Client Trigger
      await worker.save();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Analyst Report Export Failure:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = () => setShowReplaceModal(true);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* ANALYST TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-l-4 border-emerald-900 shadow-sm rounded-r-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase border border-slate-200 rounded-lg flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                </button>
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-800" />
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded-lg bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} Sync_Data
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-black h-9 px-6 rounded-lg bg-emerald-900 text-white hover:bg-emerald-950 transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export_Report
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-4">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 text-emerald-900 uppercase tracking-widest border-b pb-2"><FileSpreadsheet className="w-4 h-4" /> Personal Ledger</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Professional Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Contact Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Current Hub" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-widest text-emerald-900 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl text-sm font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-none mt-2 border-none"/>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-900">Professional Experience</h3>
                        <button onClick={addExperience} className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest hover:underline">+ New Position</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-5 rounded-xl bg-slate-50 relative group border border-slate-100">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Fiscal Period" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Focus on ROI, cost savings, and data tools..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded-xl p-3 text-sm mt-1 outline-none focus:border-emerald-600 bg-white shadow-inner"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-widest text-emerald-900 border-b pb-2">Technical Tooling</h3>
                    <InputGroup label="Skills (Separated by commas)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic Background" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 flex justify-center p-12 overflow-auto custom-scrollbar rounded-tl-[4rem] shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '14px', backgroundColor: templateConfig.primaryColor }}></div>
                    <div style={{ padding: '60px 60px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-1.5px', lineHeight: '0.9', margin: '0 0 10px 0' }}>{data.firstName} {data.lastName}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart3 size={18} color={templateConfig.primaryColor} />
                                <h2 style={{ fontSize: '16px', color: templateConfig.primaryColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</h2>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '600', lineHeight: '1.8' }}>
                            <div style={{ color: '#1e293b' }}>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>
                    <div style={{ height: '2px', backgroundColor: '#f1f5f9', margin: '0 60px 40px' }}></div>
                    <div style={{ padding: '0 60px 60px', flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '60px' }}>
                        <div>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Objective</h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#334155', fontWeight: '500' }}>{data.summary}</p>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px' }}>Case History</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px', position: 'relative', borderLeft: `2px solid #f1f5f9`, paddingLeft: '20px' }}>
                                        <div style={{ position: 'absolute', left: '-2px', top: '5px', width: '2px', height: '15px', backgroundColor: templateConfig.primaryColor }}></div>
                                        <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: templateConfig.primaryColor }}>{exp.company}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{exp.dates}</span>
                                        </div>
                                        <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569' }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>
                        <div>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px' }}>Tooling</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#f0fdf4', color: '#14532d', padding: '6px 12px', borderRadius: '6px', border: '1px solid #dcfce7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{skill.trim()}</span>
                                    ))}
                                </div>
                            </section>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>Credentials</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line', fontWeight: '700' }}>{data.education}</p>
                            </section>
                            {generatedCvNumber && (
                                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', opacity: 0.5 }}>ID_{generatedCvNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', padding: '30px 60px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Analysis Data Export // Finance_System_v4</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <div style={{ width: '4px', height: '4px', backgroundColor: templateConfig.primaryColor, borderRadius: '50%' }}></div>
                            <div style={{ width: '4px', height: '4px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Generate Analysis Report?</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">Proceeding will sync your portfolio with the data lake and generate a certified PDF manifest.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-5 py-2 rounded text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-[10px] tracking-widest">Abort</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-6 py-2 rounded-lg bg-emerald-900 text-white font-bold uppercase shadow-lg transition-all active:scale-95 text-[10px] tracking-widest">
                {isDownloading ? "Processing..." : "Confirm & Export"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-t-[8px] border-emerald-600">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32}/>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Export Certified</h3>
            <div className="bg-slate-50 py-3 rounded-xl font-mono font-bold text-emerald-700 mb-8 tracking-widest text-lg border border-slate-200">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest">
              Return to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}