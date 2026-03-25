import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, Save, Database, ShieldCheck, CheckCircle2, Wrench } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7410E] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function IndustrialMechanicExpertTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Industrial Mechanic Expert",
    primaryColor: "#B7410E", // Burnt Orange
    accentColor: "#2F4F4F",  // Dark Slate Gray
    defaultData: {
      firstName: "David",
      lastName: "Miller",
      title: "Master Industrial Mechanic",
      email: "d.miller@mechanic.com",
      phone: "+1 555 444 3322",
      location: "Houston, TX",
      summary: "Highly skilled Industrial Mechanic specializing in the preventive maintenance, troubleshooting, and repair of heavy manufacturing equipment. Expert in hydraulics, pneumatics, and motor control systems.",
      skills: "Hydraulics & Pneumatics, PLC Troubleshooting, Preventive Maintenance, Arc Welding, Blueprint Schematic Reading, Heavy Machinery Repair",
      experience: [
        { role: "Senior Maintenance Mechanic", company: "Apex Manufacturing", dates: "2016 - Present", description: "Perform daily preventative maintenance on conveyor systems and hydraulic presses. Reduced machine downtime by 25% through proactive parts replacement." },
        { role: "Industrial Mechanic", company: "Global Fabrication", dates: "2010 - 2016", description: "Diagnosed and repaired mechanical, electrical, and pneumatic defects. Trained junior mechanics on proper lockout/tagout procedures." }
      ],
      education: "A.A.S. Industrial Maintenance Technology, Texas State Technical College (2010)"
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

  // MASTER FLOW: Handshake -> Render -> Archive -> Download
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified Handshake (POST JSON)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Industrial & Skilled Trades",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;
      setGeneratedCvNumber(cvNumber);

      // 2. High-Scale Rendering (Scale 3 + Scroll Fix)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `MECHANIC_EXPERT_${cvNumber}.pdf`,
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

      // 3. Blob Archival (POST FormData)
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Download & Success UI
      await worker.save();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Industrial Archival Error:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`mechanic_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* INDUSTRIAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-[#2F4F4F] shadow-xl rounded-lg p-4 flex justify-between items-center border-b-4 border-[#B7410E]">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 h-9 px-4 uppercase rounded flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_BUILDER
                </button>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#B7410E]" />
                  <span className="font-bold text-sm text-white uppercase tracking-widest">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveDraft} disabled={isSaving} className="text-[10px] font-bold h-9 px-4 rounded bg-white/10 text-white hover:bg-white/20 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} SYNC_DRAFT
                </button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="text-[10px] font-black h-9 px-6 rounded bg-[#B7410E] text-white hover:bg-[#a33a0d] transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} EXPORT_CERTIFIED_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0 mt-4">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-900 border-b pb-2">Personnel Identity</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Professional Rank" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Secure Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Primary Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 border p-4 rounded text-sm focus:ring-1 focus:ring-[#B7410E]"/>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Maintenance & Repair History</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold text-[#B7410E] uppercase">+ New Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-5 border border-slate-100 rounded bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Rank/Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Tenure" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={4} placeholder="Key repairs, system maintenance, and downtime reduction metrics..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-3 text-sm focus:border-[#B7410E] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Technical Capabilities</h3>
                    <InputGroup label="Core Skills (Hydraulics, PLC, Welding...)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Apprenticeship & Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 overflow-auto flex justify-center p-10 custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
                    
                    {/* Industrial Sidebar */}
                    <div style={{ width: '35%', backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: `4px solid ${templateConfig.primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>
                                {data.firstName}<br/><span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                            </h1>
                            <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', opacity: 0.8 }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Contact Info</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.9 }}>
                                <div>{data.phone}</div>
                                <div>{data.email}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Technical Core</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.9 }}>{skill.trim()}</div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Qualifications</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.5', opacity: 0.9 }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ width: '65%', padding: '40px 45px' }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '3px', backgroundColor: templateConfig.primaryColor }}></div> Personnel Profile
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '3px', backgroundColor: templateConfig.primaryColor }}></div> Technical Experience
                            </h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: '700' }}>{exp.company}</span>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    {generatedCvNumber && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#CBD5E1', fontFamily: 'monospace' }}>
                            REF_ID: {generatedCvNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MASTER MODALS */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl border-l-8 border-[#B7410E]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2"><ShieldCheck className="text-[#B7410E]"/> Finalize Export?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This will sync your technical history with the central registry and generate a high-scale PDF credential.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDownloadProcess} disabled={isDownloading} className="w-full py-3 rounded bg-[#B7410E] text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs">
                {isDownloading ? "Generating..." : "Confirm & Download"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg p-10 max-w-sm w-full text-center shadow-2xl border-t-[8px] border-[#B7410E]">
            <div className="w-16 h-16 bg-orange-50 text-[#B7410E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32}/>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Credential Sync Complete</h3>
            <div className="bg-slate-50 py-3 rounded-md font-mono font-bold text-[#B7410E] mb-8 tracking-widest text-lg border border-slate-200">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded bg-[#2F4F4F] text-white font-bold uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest">
              Return to Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}