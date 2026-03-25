import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Store, BarChart4, TrendingUp, GraduationCap, MapPin, Phone, Mail,
  ShieldCheck, Database, CheckCircle2
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-tighter">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all shadow-sm font-medium text-slate-700" 
    />
  </div>
);

export default function RetailManagerEliteTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Retail Manager Elite",
    primaryColor: "#87CEEB", 
    accentColor: "#F8FAFC",  
    defaultData: {
      firstName: "James",
      lastName: "Holden",
      title: "Store Manager",
      email: "james.holden@retail.com",
      phone: "+1 555 888 7777",
      location: "Miami, FL",
      summary: "Dynamic Retail Manager with a history of transforming underperforming stores into top-revenue locations. Skilled in visual merchandising, team building, and delivering an exceptional in-store customer experience.",
      skills: "P&L Management, Visual Merchandising, Inventory Control, Staff Training, Loss Prevention, POS Systems, Customer Escalations",
      experience: [
        { role: "General Store Manager", company: "Urban Outfitters", dates: "2017 - Present", description: "Oversaw daily operations of a $5M volume store. Hired, trained, and managed a staff of 30. Exceeded annual sales goals by 15% through strategic floor layouts." },
        { role: "Assistant Manager", company: "Foot Locker", dates: "2013 - 2017", description: "Assisted in inventory audits and payroll management. Recognized as 'Employee of the Year' in 2016 for exceptional customer service." }
      ],
      education: "B.S. Retail Management, Florida State University (2013)"
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

  // STORAGE HANDSHAKE
  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`retail_elite_sync_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER FLOW: Confirm -> Sync -> Archive -> Download
  const runFinalizationProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. External Handshake (POST JSON to /resumes)
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Retail Operations",
        resumeData: data
      });

      const cvId = res.data.cvNumber;
      setGeneratedCvNumber(cvId);

      // 2. High-Scale PDF Transformation (Scale 3)
      const opt = { 
        margin: 0, 
        filename: `ELITE_RETAIL_${cvId}.pdf`, 
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

      // 4. Execution
      await worker.save();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Retail Archival Failed:", error);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* ELITE NAV BAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-md shadow-sm">
              <Store size={20} className="text-slate-900"/>
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight uppercase text-xs tracking-widest">{templateConfig.name} Builder</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={saveDraft} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Sync Data
          </button>
          <button 
            onClick={() => setShowReplaceModal(true)} 
            disabled={isDownloading} 
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
            Finalize & Archive
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* MANAGEMENT CONSOLE */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <TrendingUp size={16} className="text-[#87CEEB]"/> Manager Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                    <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                    <InputGroup label="Official Role" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                    <InputGroup label="Corporate Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                    <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                    <InputGroup label="Store Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Operations Summary</h3>
                <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none text-slate-600 leading-relaxed bg-slate-50/30 shadow-inner"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Store History</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 tracking-widest border border-sky-100 px-3 py-1 rounded-md">ADD RECORD</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/50 relative group shadow-sm transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                            <InputGroup label="Retailer" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                            <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                            <textarea rows={3} placeholder="Describe P&L impact and team size..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 focus:ring-1 focus:ring-sky-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* ELITE PREVIEW */}
        <div className="w-1/2 bg-slate-400/20 flex justify-center p-12 custom-scrollbar overflow-y-auto rounded-3xl shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>
                
                <div style={{ padding: '50px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `8px solid ${templateConfig.primaryColor}` }}>
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: '1', marginBottom: '8px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '18px', color: '#475569', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '700', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Mail size={10} className="text-[#87CEEB]"/> {data.email}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Phone size={10} className="text-[#87CEEB]"/> {data.phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><MapPin size={10} className="text-[#87CEEB]"/> {data.location}</div>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{ width: '30px', height: '2px', backgroundColor: templateConfig.primaryColor }}></div>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Executive Summary</h3>
                        </div>
                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155' }}>{data.summary}</p>
                    </section>

                    <section style={{ marginBottom: '45px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <div style={{ width: '30px', height: '2px', backgroundColor: templateConfig.primaryColor }}></div>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Professional Milestones</h3>
                        </div>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>{exp.role}</h4>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>{exp.company}</div>
                                <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '20px', height: '2px', backgroundColor: templateConfig.primaryColor }}></div>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>Management Deck</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.skills.split(',').map((s, i) => (
                                    <span key={i} style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '20px', height: '2px', backgroundColor: templateConfig.primaryColor }}></div>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>Education</h3>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', fontWeight: '600' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {generatedCvNumber && (
                  <div style={{ padding: '20px 60px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}>VERIFIED ELITE ID: {generatedCvNumber}</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#87CEEB', textTransform: 'uppercase' }}>Retail Operations Certified • {new Date().getFullYear()}</div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-[#87CEEB]">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-sky-500"/> Finalize Portfolio?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">This will sync your retail management records with the central database and generate a high-scale certified profile.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runFinalizationProcess} disabled={isDownloading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest transition-all active:scale-95 text-xs shadow-lg">
                {isDownloading ? "Archiving Record..." : "Confirm & Download"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Profile Synced</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">Your elite retail manager profile has been archived and certified.</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-sky-700 mb-8 tracking-widest text-lg border border-slate-100 shadow-sm mx-4">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#87CEEB] text-slate-900 font-bold rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest">
              Back to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}