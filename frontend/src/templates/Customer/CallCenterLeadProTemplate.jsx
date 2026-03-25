import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Headphones, BarChart3, CheckCircle2, UserCheck, Database, ShieldCheck 
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all" 
    />
  </div>
);

export default function CallCenterLeadProTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Call Center Lead Pro",
    primaryColor: "#87CEEB", 
    accentColor: "#f0f9ff",  
    defaultData: {
      firstName: "Patricia",
      lastName: "Reyes",
      title: "Call Center Supervisor",
      email: "p.reyes@callcenter.com",
      phone: "+1 555 456 7890",
      location: "Phoenix, AZ",
      summary: "Performance-oriented Call Center Supervisor with 6 years of experience managing inbound/outbound support teams. Expert in tracking call metrics (AHT, FCR, CSAT) and coaching agents to deliver outstanding service in high-volume environments.",
      skills: "Workforce Management, QA Coaching, CRM (Salesforce), Conflict Resolution, Call Metrics Analytics, Typing (90 WPM)",
      experience: [
        { role: "Call Center Supervisor", company: "TeleSolutions Inc.", dates: "2019 - Present", description: "Manage a shift of 40 agents. Reduced average handle time (AHT) by 15% through targeted training modules. Maintained a 95% First Call Resolution rate." },
        { role: "Tier 2 Support Agent", company: "Global Connect", dates: "2016 - 2019", description: "Handled escalated customer complaints. Mentored new hires during the 2-week onboarding process." }
      ],
      education: "B.A. Business Administration, Arizona State (2016)"
    }
  };

  // MASTER PATTERN STATE
  const [data, setData] = useState(templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // isDownloading state
  const [showReplaceModal, setShowReplaceModal] = useState(false); // showReplaceModal state
  const [showSuccessModal, setShowSuccessModal] = useState(false); // showSuccessModal state
  const [generatedCvNumber, setGeneratedCvNumber] = useState(""); // generatedCvNumber state

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // Quick Draft Sync
  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`callcenter_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER DOWNLOAD FLOW: Confirm -> Sync -> Archive -> Download
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified API Handshake (External Handshake)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Customer Operations",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale Rendering (Scale 3 + Scroll Fix)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `LEAD_PRO_${cvId}.pdf`,
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

      // 3. FormData Archival (Server-side File Storage Sync)
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvId}.pdf`);
      formData.append("cvNumber", cvId);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Archive -> Download -> Success UI
      await worker.save();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Operational Archival Failure:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* MASTER TOOLBAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-lg shadow-sm">
              <Headphones size={20} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight uppercase text-sm tracking-widest">{templateConfig.name} Builder</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={saveDraft} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
            Sync Draft
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-[#87CEEB] text-slate-900 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            Finalize Profile
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-6">
        {/* INPUT PANEL */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <UserCheck size={16}/> Supervisor Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Official Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Primary Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Phone Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Office Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-4">
                  <BarChart3 size={16}/> Operational Value Prop
                </h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none leading-relaxed text-slate-600"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Call Center Tenure</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest">+ Add Record</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="BPO / Company" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on metrics: AHT, FCR, CSAT improvements..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-lg p-3 text-sm text-slate-600"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-1/2 bg-slate-200 rounded-2xl overflow-auto flex justify-center p-12 custom-scrollbar shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                
                <div style={{ backgroundColor: templateConfig.primaryColor, color: '#111', padding: '45px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '-1px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#0c4a6e' }}>{data.title}</h2>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: '600', lineHeight: '1.7', color: '#0c4a6e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Mail size={10}/> {data.email}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Phone size={10}/> {data.phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><MapPin size={10}/> {data.location}</div>
                    </div>
                </div>

                <div style={{ padding: '40px 50px', flex: 1, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '50px' }}>
                    <div>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Operational Summary</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#334155' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Management Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{exp.role}</h4>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '700', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Performance Stack</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: templateConfig.accentColor, color: '#0c4a6e', padding: '10px 14px', borderRadius: '8px', fontWeight: '700', border: '1px solid #e0f2fe' }}>
                                        <CheckCircle2 size={12} className="text-[#87CEEB]"/> {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Credentials</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.7', color: '#475569', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {generatedCvNumber && (
                  <div style={{ padding: '20px 50px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>METRIC_ARCHIVE_ID: {generatedCvNumber}</div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#87CEEB', textTransform: 'uppercase' }}>Operational Sync Certified</div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border-t-[8px] border-[#87CEEB]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2"><ShieldCheck className="text-sky-500"/> Finalize Operational PDF?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This will archive your performance metrics in the supervisor database and generate a high-scale certified document.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDownloadProcess} disabled={isDownloading} className="w-full py-3 rounded-xl bg-[#87CEEB] text-slate-900 font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Archiving..." : "Confirm & Download"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-b-[8px] border-[#87CEEB]">
            <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Metrics Archived</h3>
            <div className="bg-slate-50 py-3 rounded-xl font-mono font-bold text-sky-700 mb-8 tracking-widest text-lg border border-slate-200">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#87CEEB] text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-sky-100 transition-all uppercase text-xs tracking-widest">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}