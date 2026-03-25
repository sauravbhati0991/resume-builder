import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Cpu, Terminal, Activity, ShieldCheck, LifeBuoy, Monitor,
  Database, CheckCircle2
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function SupportSpecialistModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Support Specialist Modern",
    primaryColor: "#87CEEB", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "David",
      lastName: "Kim",
      title: "IT Support Specialist",
      email: "david.kim@support.com",
      phone: "+1 555 999 8888",
      location: "Denver, CO",
      summary: "Patient and highly technical Support Specialist with a talent for translating complex IT issues into simple terms for end-users. Resolves 90% of Tier 1 & 2 tickets on the first call.",
      skills: "Active Directory, Office 365 Admin, Ticketing Systems (Jira), Hardware Troubleshooting, Remote Desktop, Empathy",
      experience: [
        { role: "IT Support Specialist", company: "TechAssist Pro", dates: "2019 - Present", description: "Provide remote technical support to 1,000+ corporate users. Managed software deployments and configured laptops for new hires." },
        { role: "Help Desk Technician", company: "Retail Corp", dates: "2015 - 2019", description: "Logged and resolved hardware failures and network connectivity issues for 50 retail locations." }
      ],
      education: "A.S. Information Technology, Denver College (2015)\nCompTIA A+ Certified"
    }
  };

  // MASTER PATTERN STATE
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

  // STORAGE HANDSHAKE
  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`tech_support_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const runDeploymentProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. External Handshake (POST JSON)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Information Technology",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale PDF Rendering (Scale 3 + Scroll Fix)
      const opt = { 
        margin: 0, 
        filename: `TECH_SUPPORT_${cvId}.pdf`, 
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

      // 4. Client Side Save & UI Update
      await worker.save();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Deployment failure:", error);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* SUPPORT HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-lg">
              <LifeBuoy size={20} className="text-slate-900"/>
            </div>
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-[0.2em]">Support Architect <span className="font-normal text-slate-400 ml-2">v3.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={saveDraft} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Sync Local
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />} 
            Deploy Profile
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* TECH EDITOR */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Monitor size={16} className="text-[#87CEEB]"/> Station Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Technical Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Base Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Objective</h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none text-slate-600 bg-slate-50/50 font-mono shadow-inner"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident History</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.1em] border border-sky-100 px-3 py-1 rounded-md">ADD LOG ENTRY</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/30 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Uptime" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Key deliverables, SLA metrics, or hardware managed..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 focus:ring-1 focus:ring-sky-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* MODERN PREVIEW */}
        <div className="w-1/2 bg-slate-200 flex justify-center overflow-y-auto p-12 custom-scrollbar shadow-inner rounded-3xl">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                {/* Tech Sidebar */}
                <div style={{ width: '35%', backgroundColor: '#0f172a', color: 'white', padding: '50px 30px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '50px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase', color: templateConfig.primaryColor }}>{data.firstName}<br/>{data.lastName}</h1>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '15px', color: '#94a3b8' }}>{data.title}</p>
                    </div>

                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Communications</h3>
                        <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={12} className="text-[#87CEEB]"/> {data.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Terminal size={12} className="text-[#87CEEB]"/> {data.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={12} className="text-[#87CEEB]"/> {data.location}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Tech Stack</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {data.skills.split(',').map((skill, i) => (
                                <div key={i} style={{ fontSize: '10px', backgroundColor: 'rgba(135,206,235,0.1)', color: '#87CEEB', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(135,206,235,0.2)' }}>{skill.trim()}</div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Credentials</h3>
                        <p style={{ fontSize: '11px', lineHeight: '1.7', whiteSpace: 'pre-line', color: '#cbd5e1' }}>{data.education}</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ width: '65%', padding: '50px 50px', backgroundColor: 'white' }}>
                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <ShieldCheck size={18} className="text-[#87CEEB]"/> Executive Profile
                        </h3>
                        <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#475569', fontStyle: 'italic' }}>"{data.summary}"</p>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <Activity size={18} className="text-[#87CEEB]"/> Professional Uptime
                        </h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '35px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #f1f5f9' }}>
                                <div style={{ position: 'absolute', left: '-2px', top: '0', width: '2px', height: '15px', backgroundColor: templateConfig.primaryColor }}></div>
                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '800', textTransform: 'uppercase' }}>{exp.company}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>

                {/* TECH FOOTER */}
                {generatedCvNumber && (
                  <div style={{ position: 'absolute', bottom: '25px', left: '0', right: '0', textAlign: 'center', opacity: 0.3 }}>
                    <div style={{ fontSize: '8px', color: '#475569', fontFamily: 'monospace' }}>
                      SYS_VERIFY_ID: {generatedCvNumber} | INTEGRITY_CHECK: PASSED
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-[#87CEEB]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-sky-500"/> Deploy Changes?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This will sync your technical logs to the mainframe and archive a high-scale certified documentation of your career.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDeploymentProcess} disabled={isDownloading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Pushing Logs..." : "Commit & Deploy"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">System Updated</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Technical profile archived successfully with ID signature.</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-sky-700 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Return to Station
            </button>
          </div>
        </div>
      )}
    </div>
  );
}