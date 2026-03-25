import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Users2, HeartHandshake, Briefcase, GraduationCap, ShieldCheck, Database, CheckCircle2 
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function ClientRelationsExpertTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Client Relations Expert",
    primaryColor: "#87CEEB", 
    accentColor: "#f0f9ff",  
    defaultData: {
      firstName: "Sarah",
      lastName: "Connor",
      title: "Client Relations Expert",
      email: "sarah.connor@relations.com",
      phone: "+1 555 222 1111",
      location: "Los Angeles, CA",
      summary: "Client-focused professional with a passion for building long-term relationships and resolving complex disputes. Expert at identifying client needs, upselling services, and maintaining a high retention rate for VIP accounts.",
      skills: "VIP Account Management, Dispute Resolution, B2B Communication, Salesforce CRM, Upselling, Active Listening",
      experience: [
        { role: "Senior Client Relations Manager", company: "Elite Services Group", dates: "2018 - Present", description: "Serve as the primary point of contact for 30 top-tier client accounts. Resolved 100% of escalated client disputes within 24 hours, increasing contract renewals by 15%." },
        { role: "Customer Experience Associate", company: "Premium Brands", dates: "2014 - 2018", description: "Conducted onboarding sessions for new clients. Gathered feedback to improve the product development roadmap." }
      ],
      education: "B.S. Business Administration, UCLA (2014)"
    }
  };

  // MASTER PATTERN STATE MANAGEMENT
  const [data, setData] = useState(templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Explicit tracking
  const [showReplaceModal, setShowReplaceModal] = useState(false); // UX Guardrail
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success state
  const [generatedCvNumber, setGeneratedCvNumber] = useState(""); // Sync ID

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // Handshake & Sync Logic
  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`client_relations_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified API Handshake (POST JSON)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Client Services",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale Rendering (Scale 3 + Elite PDF)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `EXPERT_RELATIONS_${cvId}.pdf`,
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
      formData.append("file", pdfBlob, `${cvId}.pdf`);
      formData.append("cvNumber", cvId);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Download Execution
      await worker.save();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Client Portfolio Archival Error:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* MASTER TOOLBAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-lg shadow-inner">
              <HeartHandshake size={20} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight uppercase text-sm tracking-widest">{templateConfig.name} Builder</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={saveDraft} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
            Sync Draft
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            Export Portfolio
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* INPUT EDITOR */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Users2 size={16} className="text-[#87CEEB]"/> Account Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Professional Rank" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Direct Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Secure Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Primary Territory" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-4">Professional Value Prop</h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none text-slate-600 italic leading-relaxed shadow-inner bg-slate-50/30"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Experience Portfolio</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-500 hover:text-sky-600 uppercase tracking-widest shadow-sm border border-sky-100 px-3 py-1 rounded-full">+ Add Record</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group shadow-sm transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Rank" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Client/Company" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Tenure" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on retention rates and dispute resolution metrics..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 focus:ring-1 focus:ring-sky-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-1/2 bg-slate-300 flex justify-center overflow-y-auto p-12 custom-scrollbar shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                
                <div style={{ height: '16px', backgroundColor: templateConfig.primaryColor, width: '100%' }}></div>
                
                <div style={{ textAlign: 'center', padding: '50px 60px 30px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '4px', lineHeight: '1', marginBottom: '10px' }}>
                        {data.firstName} <span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '25px' }}>{data.title}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '12px 0', fontWeight: 'bold' }}>
                        <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '20px 60px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '45px' }}>
                        <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#475569', textAlign: 'center', fontStyle: 'italic', maxWidth: '85%', margin: '0 auto' }}>"{data.summary}"</p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '50px' }}>
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Briefcase size={16} className="text-[#87CEEB]"/>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Strengths</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.skills.split(',').map((s, i) => (
                                    <span key={i} style={{ fontSize: '11px', backgroundColor: '#f0f9ff', color: '#0c4a6e', padding: '5px 12px', borderRadius: '4px', fontWeight: '700', border: '1px solid #e0f2fe' }}>
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <GraduationCap size={16} className="text-[#87CEEB]"/>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Education</h3>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                        </section>
                    </div>

                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                            <HeartHandshake size={18} className="text-[#87CEEB]"/>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Professional Portfolio</h3>
                        </div>
                        <div>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative', paddingLeft: '25px', borderLeft: '2px solid #f1f5f9' }}>
                                    <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: templateConfig.primaryColor }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {generatedCvNumber && (
                  <div style={{ position: 'absolute', bottom: '25px', left: '0', right: '0', textAlign: 'center', opacity: 0.6 }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                      AUTHENTICATED RELATIONS EXPERT • {generatedCvNumber}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border-t-[8px] border-[#87CEEB]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-sky-500"/> Finalize Portfolio?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This will sync your client portfolio history with the master database and generate a high-scale certified PDF.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDownloadProcess} disabled={isDownloading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Archiving Portfolio..." : "Confirm & Download"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border-b-[12px] border-[#87CEEB]">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={48}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Success</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Your relations expert profile has been certified and archived.</p>
            <div className="bg-slate-50 py-4 rounded-2xl font-mono font-bold text-sky-700 mb-8 tracking-widest text-lg border border-slate-200 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-[80%] py-4 bg-[#87CEEB] text-slate-900 font-bold rounded-full shadow-lg hover:shadow-sky-100 transition-all uppercase text-xs tracking-widest mx-auto">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}