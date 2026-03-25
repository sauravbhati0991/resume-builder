import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Scale, Landmark, ShieldAlert, Award,
  Database, CheckCircle2, Lock, FileText, Gavel
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-[0.15em]">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border-2 border-slate-100 bg-white px-4 py-2 text-sm focus:outline-none focus:border-[#00008B] transition-colors shadow-sm font-medium text-slate-700" 
    />
  </div>
);

export default function CorporateCounselEliteTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Corporate Counsel Elite",
    primaryColor: "#00008B", 
    accentColor: "#F5F5DC",  
    defaultData: {
      firstName: "Robert",
      lastName: "Zane",
      title: "General Corporate Counsel",
      email: "robert.zane@corporate.com",
      phone: "+1 555 400 5000",
      location: "San Francisco, CA",
      summary: "Executive-level Corporate Counsel providing strategic legal guidance to executive boards and C-suite leaders. Expert in corporate governance, intellectual property protection, and high-value Mergers & Acquisitions. Trusted advisor for steering companies through complex regulatory landscapes.",
      skills: "Corporate Governance, Intellectual Property Law, Mergers & Acquisitions, Employment Law, Regulatory Compliance, International Trade, Legal Strategy",
      experience: [
        { role: "General Counsel", company: "Tech Innovators Inc.", dates: "2018 - Present", description: "Advise the Board of Directors on corporate governance and fiduciary duties. Led the legal strategy for a successful $200M IPO. Overhauled internal IP protection protocols." },
        { role: "Senior Corporate Counsel", company: "Global Enterprises", dates: "2010 - 2018", description: "Drafted and negotiated complex international joint venture agreements. Managed external legal counsel and reduced annual legal spend by 25%." }
      ],
      education: "J.D., Harvard Law School (2010)\nB.A. Economics, University of Pennsylvania (2007)"
    }
  };

  // MASTER PATTERN STATE MANAGEMENT
  const [data, setData] = useState(templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // SERVER-SIDE SYNC
  const syncLegalVault = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`legal_elite_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const executeArchivalHandshake = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified Handshake (POST JSON to /resumes)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Executive Legal",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale Rendering (Scale 3 + Scroll Fix)
      const opt = { 
        margin: 0, 
        filename: `EXECUTIVE_COUNSEL_${cvId}.pdf`, 
        image: { type: 'jpeg', quality: 1.0 }, 
        html2canvas: { 
          scale: 3, 
          useCORS: true,
          scrollX: 0,
          scrollY: -window.scrollY
        }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
      };

      const worker = html2pdf().set(opt).from(previewRef.current);
      const pdfBlob = await worker.output("blob");

      // 3. Binary Archive (POST Blob via FormData)
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvId}.pdf`);
      formData.append("cvNumber", cvId);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Client Side Download
      await worker.save();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Legal filing failed:", error);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-200 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* ELITE HEADER */}
      <div className="w-full bg-slate-900 border-b border-slate-700 px-8 py-4 flex justify-between items-center z-20 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/templates')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
            <Landmark size={24} className="text-[#F5F5DC]"/>
            <h2 className="font-bold text-white tracking-widest text-lg uppercase italic">Elite Counsel <span className="text-slate-500 font-light ml-2 text-sm tracking-normal">Series v4.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={syncLegalVault} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 rounded bg-slate-800 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Vault Sync
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-[#00008B] text-white px-8 py-2 rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:brightness-125 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} 
            File Archive
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full overflow-hidden flex gap-10">
        {/* EDITOR CONSOLE */}
        <div className="w-[45%] overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-32">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#00008B]">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <ShieldAlert size={18} className="text-[#00008B]"/> Executive Identification
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Official Designation" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Corporate Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Secure Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Jurisdiction/Base" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#00008B]">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Strategic Summary</h3>
                <textarea rows={5} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border-2 border-slate-100 rounded-xl p-4 text-sm focus:border-[#00008B] outline-none text-slate-700 bg-slate-50 font-medium leading-relaxed shadow-inner"/>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#00008B]">
                 <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Career Chronology</h3>
                    <button onClick={addExperience} className="px-4 py-1.5 bg-[#00008B] text-white text-[10px] font-black rounded-full hover:shadow-lg transition-all">ADD TENURE</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-8 p-6 border-2 border-slate-50 rounded-2xl bg-slate-50/50 relative group transition-all hover:bg-white hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><Trash2 size={14}/></button>
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on board advisement, M&A due diligence, and risk mitigation..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border-2 border-slate-100 rounded-xl p-4 text-sm text-slate-600 font-medium focus:border-blue-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="w-[55%] flex justify-center overflow-y-auto custom-scrollbar bg-slate-400/20 rounded-3xl p-12 shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.4)', fontFamily: '"Georgia", serif' }}>
                
                {/* Elite Brand Header */}
                <div style={{ padding: '60px 60px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: `4px double ${templateConfig.primaryColor}` }}>
                    <div style={{ width: '60%' }}>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', lineHeight: '0.9', marginBottom: '15px', letterSpacing: '-1.5px' }}>{data.firstName}<br />{data.lastName}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ height: '2px', width: '30px', backgroundColor: '#00008B' }}></div>
                          <h2 style={{ fontSize: '15px', color: '#111', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>{data.title}</h2>
                        </div>
                    </div>
                    <div style={{ width: '35%', backgroundColor: templateConfig.accentColor, padding: '25px', borderRadius: '2px', fontSize: '11px', color: '#00008B', fontWeight: '900', lineHeight: '2', border: '1px solid rgba(0,0,139,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><Phone size={14} strokeWidth={3}/> {data.phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><Mail size={14} strokeWidth={3}/> {data.email}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={14} strokeWidth={3}/> {data.location}</div>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '60px' }}>
                    
                    {/* Primary Narrative */}
                    <div>
                        <section style={{ marginBottom: '45px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <Scale size={18} color="#00008B"/>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Executive Directive</h3>
                          </div>
                          <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#1e293b', textAlign: 'justify' }}>{data.summary}</p>
                        </section>

                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                              <Gavel size={18} color="#00008B"/>
                              <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Professional Tenure</h3>
                            </div>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                    <h4 style={{ fontSize: '17px', fontWeight: '900', color: '#000', margin: '0 0 5px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', color: '#00008B', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{exp.company}</span>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '4px' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    {/* Technical Column */}
                    <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '40px' }}>
                        <section style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '1px' }}>Core Expertise</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00008B', marginTop: '6px' }}></div>
                                      <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 'bold', lineHeight: '1.4' }}>
                                          {skill.trim()}
                                      </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                              <Award size={16} color="#00008B"/>
                              <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Academic</h3>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {/* ELITE FOOTER */}
                {generatedCvNumber && (
                  <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>RECORD_ID: {generatedCvNumber}</div>
                    <div style={{ fontSize: '8px', color: '#00008B', fontWeight: '900', textTransform: 'uppercase' }}>Privileged & Confidential • Corporate Filing</div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-[#00008B]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <Lock className="text-[#00008B]"/> Verify Archival
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This action will synchronize your professional tenure with the corporate legal vault and generate a high-scale certified archive.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeArchivalHandshake} disabled={isDownloading} className="w-full py-4 rounded-xl bg-[#00008B] text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Archiving..." : "Confirm & Export"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Finalized</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Your executive credentials have been archived and assigned a secure record ID.</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-[#00008B] mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#00008B] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Exit Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}