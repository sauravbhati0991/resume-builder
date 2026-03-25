import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, MousePointer2, Layout, Figma, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-[0.2em]">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border-2 border-slate-100 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700" 
    />
  </div>
);

export default function UxUiDesignerModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "UX/UI Designer Modern",
    primaryColor: "#0F172A", // Slate 900
    accentColor: "#D1FAE5",  // Emerald 100
    defaultData: {
      firstName: "Leo",
      lastName: "Martinez",
      title: "Product / UX Designer",
      email: "leo.ux@example.com",
      phone: "+1 555 777 8888",
      location: "San Francisco, CA",
      summary: "Human-centric UX/UI Designer with a background in cognitive psychology. Dedicated to creating intuitive, accessible, and delightful digital products. Experienced in end-to-end design from user research and wireframing to high-fidelity prototyping and design systems.",
      skills: "Figma, Sketch, Prototyping, User Research, Usability Testing, HTML/CSS, Design Systems, Wireframing",
      experience: [
        { role: "Senior Product Designer", company: "TechFlow Apps", dates: "2021 - Present", description: "Lead design for a B2B SaaS dashboard used by 10k+ businesses. Created and maintained a comprehensive Figma design system that accelerated development handoff by 30%." },
        { role: "UX/UI Designer", company: "Creative Startups", dates: "2018 - 2021", description: "Designed mobile applications for 4 early-stage startups. Conducted weekly user testing sessions to iterate on MVP features and reduced churn by 12%." }
      ],
      education: "B.S. Interaction Design, California College of the Arts (2018)"
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

  // Quick Save (Draft Cache)
  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`ux_modern_sync_${templateId}`, JSON.stringify(data));
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
        categoryName: "Product Design",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. High-Scale Rendering (Scale 3 + Scroll Compensation)
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `UX_PORTFOLIO_${cvNumber}.pdf`,
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

      // 3. Server-Side Archive (File + DB Sync)
      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Client Download & Finalize
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("UX Design Archival Error:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = () => setShowReplaceModal(true);

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* DESIGNER TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase rounded-xl transition-all flex items-center text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <div className="h-6 w-px bg-slate-100 mx-2"></div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs uppercase tracking-widest text-slate-800">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all uppercase flex items-center text-slate-700">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} Save_Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-bold h-9 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* COMPONENT EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6 pt-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 text-slate-900 uppercase tracking-[0.3em]"><Layout className="w-4 h-4" /> Attributes</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="User_First" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="User_Last" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Professional_Role" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email_Node" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact_Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Base_Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-slate-900">User Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-100 focus:outline-none border-none mt-2 text-slate-600 leading-relaxed"/>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Case Studies / Roles</h3>
                        <button onClick={addExperience} className="text-[10px] text-purple-600 font-bold uppercase tracking-widest hover:underline">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded-2xl border border-slate-50 bg-slate-50/50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Highlight metrics and tools used..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 bg-white border border-slate-100 rounded-xl p-3 text-sm font-medium mt-2 outline-none focus:border-purple-200 transition-all"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-slate-900">Toolkit & Knowledge</h3>
                    <InputGroup label="Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-8"></div>
                    <InputGroup label="Education_History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* DESIGN PREVIEW */}
            <div className="h-full bg-slate-100 flex justify-center p-12 overflow-auto custom-scrollbar rounded-tl-[3rem]">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '80px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                        <div>
                            <h1 style={{ fontSize: '48px', fontWeight: '800', color: templateConfig.primaryColor, letterSpacing: '-2px', lineHeight: '0.9', margin: '0 0 15px 0' }}>
                                {data.firstName}<br/>{data.lastName}
                            </h1>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <Figma size={16} /> {data.title}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', fontWeight: '600', lineHeight: '2' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '60px' }}>
                        <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#475569', maxWidth: '90%', fontWeight: '450' }}>{data.summary}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '60px', flex: 1 }}>
                        
                        <div>
                            <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Selected Case Studies</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: templateConfig.primaryColor, margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1', marginBottom: '12px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#64748b' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Toolkit</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ fontSize: '10px', fontWeight: '800', color: '#065f46', backgroundColor: templateConfig.accentColor, padding: '6px 14px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Academic</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', fontWeight: '600' }}>{data.education}</p>
                            </section>

                            {generatedCvNumber && (
                                <div style={{ marginTop: 'auto', paddingTop: '100px', opacity: 0.3 }}>
                                    <div style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Index_Asset_ID</div>
                                    <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>#{generatedCvNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>UX_UI Portfolio System v2.0</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }}></div>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: templateConfig.accentColor }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Export Asset?</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">This will commit your changes to the design server and generate a high-fidelity PDF for distribution.</p>
            <div className="flex flex-col gap-3">
              <button onClick={runDownloadProcess} disabled={isDownloading} className="w-full py-4 rounded-2xl text-white font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95 text-xs bg-slate-900">
                {isDownloading ? "Generating..." : "Sync & Download"}
              </button>
              <button onClick={() => setShowReplaceModal(false)} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 hover:bg-slate-50 font-bold transition-all uppercase text-xs tracking-widest">Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-sm w-full text-center shadow-2xl border-t-[10px] border-emerald-400">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter">Asset Linked</h3>
            <p className="text-sm text-slate-400 mb-8 font-medium italic underline underline-offset-4">Version Control ID:</p>
            <div className="bg-slate-50 py-4 rounded-2xl font-mono font-bold text-slate-900 mb-8 tracking-[0.3em] text-lg border border-slate-100">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-2xl text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest bg-purple-600">
              Back to Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}