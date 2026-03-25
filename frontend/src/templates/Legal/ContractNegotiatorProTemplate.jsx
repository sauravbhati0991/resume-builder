import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Scale, Briefcase, FileCheck, Award,
  Database, CheckCircle2, ShieldAlert
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00008B] transition-all shadow-sm font-medium text-slate-700" 
    />
  </div>
);

export default function ContractNegotiatorProTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Contract Negotiator Pro",
    primaryColor: "#00008B", 
    accentColor: "#F5F5DC",  
    defaultData: {
      firstName: "Michael",
      lastName: "Ross",
      title: "Senior Contract Negotiator",
      email: "m.ross@legal.com",
      phone: "+1 555 101 2020",
      location: "New York, NY",
      summary: "Detail-oriented Contract Negotiator with 8 years of experience drafting, reviewing, and executing high-value commercial agreements. Proven track record of protecting corporate interests, reducing legal exposure by 30%, and expediting the deal cycle for Fortune 500 tech clients.",
      skills: "Commercial Contracts (MSA, NDA, SOW), Deal Structuring, Risk Mitigation, Vendor Negotiation, IP Licensing, Regulatory Compliance",
      experience: [
        { role: "Lead Contract Negotiator", company: "Global Tech Solutions", dates: "2019 - Present", description: "Negotiate and close 50+ enterprise SaaS agreements annually. Standardized the MSA template process, reducing contract turnaround time by 15 days." },
        { role: "Contracts Administrator", company: "Finance Partners LLC", dates: "2015 - 2019", description: "Reviewed vendor agreements for compliance with internal risk policies. Facilitated communication between legal, sales, and procurement teams." }
      ],
      education: "J.D., Columbia Law School (2015)\nB.A. Pre-Law, NYU (2012)"
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

  // STORAGE SYNC HANDSHAKE
  const syncContractState = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`contract_pro_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const executeFinalDeployment = async () => {
    try {
      setIsDownloading(true);

      // 1. Unified API Handshake (POST JSON)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Legal",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale Rendering (Scale 3 + Scroll Correction)
      const opt = { 
        margin: 0, 
        filename: `CONTRACT_ARCHIVE_${cvId}.pdf`, 
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

      // 4. Client-Side Save
      await worker.save();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Contract deployment failed:", error);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* PROFESSIONAL HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#00008B] p-2 rounded shadow-md">
              <Scale size={20} className="text-[#F5F5DC]"/>
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight uppercase text-xs tracking-[0.2em]">{templateConfig.name} <span className="text-slate-400 font-medium ml-1">v4.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={syncContractState} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Local Sync
          </button>
          <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="flex items-center gap-2 bg-[#00008B] text-white px-6 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
            Execute Archive
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* CONTRACT EDITOR */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Briefcase size={16} className="text-blue-900"/> Professional Profile
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Professional Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Business Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Contact Number" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Office Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-1 focus:ring-[#00008B] outline-none text-slate-600 bg-slate-50/30 font-serif italic shadow-inner"/>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Deal Experience</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-blue-800 hover:underline tracking-widest uppercase">+ ADD CLAUSE</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded bg-slate-50/50 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Position" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Firm/Corp" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Term" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Key deal terms, negotiation wins, or contract types..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded p-3 text-sm text-slate-600 focus:ring-1 focus:ring-blue-100 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW */}
        <div className="w-1/2 bg-slate-300 flex justify-center overflow-y-auto p-12 custom-scrollbar rounded-3xl shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', fontFamily: '"Times New Roman", Times, serif' }}>
                
                {/* Header Block */}
                <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '50px 60px', borderBottom: `8px solid ${templateConfig.accentColor}` }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0' }}>{data.firstName} {data.lastName}</h1>
                    <h2 style={{ fontSize: '18px', color: templateConfig.accentColor, fontWeight: 'normal', letterSpacing: '2px', margin: 0, opacity: 0.9 }}>{data.title}</h2>
                    
                    <div style={{ display: 'flex', gap: '25px', marginTop: '30px', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} color={templateConfig.accentColor}/> {data.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} color={templateConfig.accentColor}/> {data.phone}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} color={templateConfig.accentColor}/> {data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Award size={16}/> Professional Statement
                        </h3>
                        <p style={{ fontSize: '13.5px', lineHeight: '1.7', color: '#111', textAlign: 'justify' }}>{data.summary}</p>
                    </section>

                    <section style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileCheck size={16}/> Transactional History
                        </h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.role}</h4>
                                    <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#666', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#222', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <section>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px' }}>Specialized Skills</h3>
                            <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '13px', color: '#111', lineHeight: '1.8' }}>
                                {data.skills.split(',').map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s.trim()}</li>)}
                            </ul>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px' }}>Academic Background</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#111', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {/* AUTHENTICITY FOOTER */}
                {generatedCvNumber && (
                  <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: '9px', color: '#aaa', fontFamily: 'monospace', textAlign: 'right' }}>
                    AUDIT_REF: {generatedCvNumber}<br/>
                    <span style={{ fontSize: '8px' }}>Certified Transactional Record</span>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-[#00008B]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-blue-900"/> Verify Archival
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">Archiving will finalize your transactional record and sync these credentials with the server for professional verification.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeFinalDeployment} disabled={isDownloading} className="w-full py-4 rounded-md bg-[#00008B] text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Executing..." : "Confirm & Export"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Archive Finalized</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Your professional record has been synchronized and the transaction ID generated.</p>
            <div className="bg-slate-50 py-4 rounded-md font-mono font-bold text-blue-900 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#00008B] text-white font-bold rounded-md shadow-lg transition-all uppercase text-xs tracking-widest">
              Close Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}