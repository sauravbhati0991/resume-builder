import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, ShieldCheck, Scale, FileText, Gavel,
  Database, CheckCircle2, Lock
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00008B] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function ComplianceOfficerModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Compliance Officer Modern",
    primaryColor: "#00008B", 
    accentColor: "#F5F5DC",  
    defaultData: {
      firstName: "Louis",
      lastName: "Litt",
      title: "Chief Compliance Officer",
      email: "l.litt@corporate.com",
      phone: "+1 555 999 0000",
      location: "Chicago, IL",
      summary: "Strategic Chief Compliance Officer with expertise in SEC regulations, financial auditing, and corporate governance. Adept at designing internal control frameworks that ensure strict compliance while supporting business growth.",
      skills: "SEC Regulations, GDPR Compliance, Internal Auditing, Risk Assessment, Corporate Governance, Anti-Money Laundering (AML)",
      experience: [
        { role: "Chief Compliance Officer", company: "FinTech Global", dates: "2020 - Present", description: "Direct global compliance programs across 12 countries. Successfully passed 5 consecutive external SEC audits with zero violations." },
        { role: "Compliance Manager", company: "Bank of Americas", dates: "2014 - 2020", description: "Developed and implemented AML training for 5,000+ employees. Monitored transaction reports to identify and investigate suspicious activities." }
      ],
      education: "Master of Laws (LL.M.), Chicago Law (2014)\nCertified Regulatory Compliance Manager (CRCM)"
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

  // STORAGE SYNC
  const syncComplianceData = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`compliance_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const executeArchivalHandshake = async () => {
    try {
      setIsDownloading(true);

      // 1. External Handshake (POST JSON to /resumes)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Legal & Compliance",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale PDF Transformation (Scale 3 + Scroll Fix)
      const opt = { 
        margin: 0, 
        filename: `GOVERNANCE_AUDIT_${cvId}.pdf`, 
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

      // 3. Binary Handshake (POST Blob via FormData)
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvId}.pdf`);
      formData.append("cvNumber", cvId);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Client Side Finalization
      await worker.save();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Regulatory Archival Failed:", error);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* GOVERNANCE HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#00008B] p-2 rounded-md shadow-lg">
              <ShieldCheck size={20} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight uppercase text-xs tracking-widest">Compliance Architect <span className="text-slate-400 font-normal ml-2">v4.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={syncComplianceData} disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Sync Vault
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-[#00008B] text-white px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-md hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} 
            Archive Portfolio
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* DATA ENTRY CONSOLE */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <FileText size={16} className="text-indigo-900"/> Identity Verification
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Executive Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Official Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Direct Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Primary Jurisdiction" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Governance Summary</h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00008B] outline-none text-slate-600 bg-slate-50/30 shadow-inner leading-relaxed"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Regulatory Experience</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 tracking-widest border border-indigo-50 px-3 py-1 rounded-md">ADD RECORD</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/50 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Institution" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on regulatory frameworks, audits, and P&L compliance..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 focus:ring-1 focus:ring-indigo-100 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* REGULATORY PREVIEW */}
        <div className="w-1/2 bg-slate-300 flex justify-center overflow-y-auto p-12 custom-scrollbar rounded-3xl shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 40px 80px -12px rgba(0,0,0,0.3)' }}>
                
                {/* Authority Header */}
                <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '50px 60px', borderBottom: `10px solid ${templateConfig.accentColor}` }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: '1', marginBottom: '8px' }}>{data.firstName} {data.lastName}</h1>
                    <h2 style={{ fontSize: '18px', color: templateConfig.accentColor, fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                    
                    <div style={{ display: 'flex', gap: '25px', marginTop: '30px', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} color={templateConfig.accentColor}/> {data.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} color={templateConfig.accentColor}/> {data.phone}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} color={templateConfig.accentColor}/> {data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '35px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Gavel size={18} className="text-[#00008B]"/>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Executive Summary</h3>
                        </div>
                        <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#1e293b', fontWeight: '500' }}>{data.summary}</p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '50px' }}>
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <Scale size={18} className="text-[#00008B]"/>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Professional Audit</h3>
                            </div>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{exp.company}</span>
                                        <span style={{ fontSize: '10px', backgroundColor: templateConfig.accentColor, color: templateConfig.primaryColor, padding: '3px 10px', borderRadius: '4px', fontWeight: '900' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '30px' }}>
                            <section style={{ marginBottom: '35px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px' }}>Core Domains</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#334155', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', borderRight: `4px solid ${templateConfig.primaryColor}` }}>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Credentials</h3>
                                <p style={{ fontSize: '11.5px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* AUDIT FOOTER */}
                {generatedCvNumber && (
                  <div style={{ padding: '20px 60px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}>RECORD_ID: {generatedCvNumber}</div>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: templateConfig.primaryColor, textTransform: 'uppercase' }}>Governance Portfolio • Certified Authenticity</div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-[#00008B]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <Lock className="text-indigo-900"/> Verify Archival?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This action will synchronize your governance records with the server and generate a high-scale certified audit of your professional career.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeArchivalHandshake} disabled={isDownloading} className="w-full py-4 rounded-xl bg-[#00008B] text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Synchronizing..." : "Confirm & Archive"}
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
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Audit Complete</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Your compliance portfolio has been archived and signed with a unique audit ID.</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-indigo-900 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#00008B] text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Back to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}