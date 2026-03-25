import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Briefcase, GraduationCap, Settings2, Globe, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
    />
  </div>
);

export default function ProjectEngineerModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Project Engineer Modern",
    primaryColor: "#0F172A", // Deep Navy
    accentColor: "#10B981",  // Emerald (Success/Growth)
    defaultData: {
      firstName: "Samantha",
      lastName: "Reed",
      title: "Senior Project Engineer",
      email: "s.reed@engineering.com",
      phone: "+1 555 333 4444",
      location: "Denver, CO",
      summary: "Strategic Project Engineer with 8 years of experience overseeing large-scale civil and commercial construction projects from bidding to closeout. Skilled in cross-functional team leadership, budget tracking, and mitigating project risks.",
      skills: "Primavera P6, MS Project, Procore, Budget Forecasting, Risk Management, Contract Negotiation, Quality Assurance",
      experience: [
        { role: "Senior Project Engineer", company: "Summit Construction", dates: "2018 - Present", description: "Managed a $45M commercial development project. Coordinated RFI/Submittal logs and ensured compliance with local building codes, finishing 3 weeks ahead of schedule." },
        { role: "Project Engineer", company: "Highland Builders", dates: "2015 - 2018", description: "Assisted PMs in budget tracking and scheduling for residential projects. Facilitated weekly subcontractor coordination meetings." }
      ],
      education: "B.S. Construction Management, Colorado State University"
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

  // Local Sync
  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`modern_proj_eng_${templateId}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  // MASTER LOGIC: Handshake -> Render -> Archive -> Download
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Handshake with Unified API
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Project Engineering",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. High-Scale Rendering (Scale 3 + Scroll Fix)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `PROJ_ENG_${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
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

      // 3. Server-Side Archive (Blob via FormData)
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Finalize
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Master Logic Fault:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = () => setShowReplaceModal(true);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* STEERING BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-100 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Progress
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-lg hover:brightness-110 disabled:opacity-70 transition-all" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export Document
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* BUILDER PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-widest"><Globe className="w-4 h-4 text-blue-500" /> Core Logistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Given Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Surname" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Project Role" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact Number" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Primary Region" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Executive Brief</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed bg-slate-50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Project History</h3><button onClick={addExperience} className="text-xs text-emerald-600 font-bold hover:underline tracking-tight">+ Add Entry</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe project scale, budgets, and outcomes..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Competencies & Credentials</h3>
                    <InputGroup label="Project Tools & Skills" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Highest Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '50px 60px 40px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <h1 style={{ fontSize: '44px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 10px 0', lineHeight: '1' }}>
                            {data.firstName} <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                        </h1>
                        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
                            {data.title}
                        </h2>
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', fontSize: '12px', color: '#475569', fontWeight: '700' }}>
                            <span>{data.email}</span>
                            <span style={{ width: '4px', height: '4px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></span>
                            <span>{data.phone}</span>
                            <span style={{ width: '4px', height: '4px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></span>
                            <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '35px 60px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', textAlign: 'center', fontWeight: '500', maxWidth: '800px', margin: '0 auto' }}>{data.summary}</p>
                        </div>

                        <div style={{ padding: '50px 60px', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '50px' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Briefcase size={16} color={templateConfig.accentColor} /> Project Experience
                                </h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: templateConfig.accentColor, fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div style={{ marginBottom: '45px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Settings2 size={16} color={templateConfig.accentColor} /> Capabilities
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {data.skills.split(',').map((skill, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#1e293b', borderLeft: `3px solid ${templateConfig.accentColor}`, paddingLeft: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <GraduationCap size={16} color={templateConfig.accentColor} /> Education
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', fontWeight: '700', margin: 0 }}>{data.education}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with CV ID Sync */}
                    {generatedCvNumber && (
                        <div style={{ padding: '20px 60px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Verification ID: {generatedCvNumber}
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Auth: ResumeA_Global
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Export to PDF?</h3>
            <p className="text-sm text-slate-600 mb-6 font-medium">This will sync your project record and generate a trackable CV Number for your dashboard.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-6 py-2 rounded-lg text-white font-black uppercase shadow-md transition-all active:scale-95" style={{ backgroundColor: templateConfig.accentColor }}>
                {isDownloading ? "Generating..." : "Sync & Download"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-t-8" style={{ borderColor: templateConfig.accentColor }}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32}/>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Success</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Portfolio synced successfully. Your document reference number is:</p>
            <div className="bg-slate-100 py-3 rounded-lg font-mono font-bold text-slate-900 mb-6 tracking-widest text-lg border border-dashed border-slate-300">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-xl text-white font-black uppercase shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
              Back to Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}