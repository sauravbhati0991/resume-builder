import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Landmark, ShieldCheck, Briefcase, Award, Scale } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] transition-all" />
  </div>
);

export default function PublicSectorDirectorEliteTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Public Sector Director Elite",
    primaryColor: "#8B0000", 
    accentColor: "#D3D3D3",  
    defaultData: {
      firstName: "Jonathan",
      lastName: "Sterling",
      title: "Director of Public Works",
      email: "j.sterling@citygov.org",
      phone: "+1 555 999 8888",
      location: "Chicago, IL",
      summary: "Executive-level Public Sector Director with 15+ years of leadership in municipal government. Proven expertise in managing large-scale infrastructure projects, navigating complex regulatory environments, and ensuring absolute fiscal responsibility of multi-million dollar public funds.",
      skills: "Municipal Administration, Infrastructure Planning, Public Budgeting, Union Negotiations, Regulatory Compliance, Crisis Management",
      experience: [
        { role: "Director of Public Works", company: "City of Chicago", dates: "2016 - Present", description: "Manage a department of 300+ employees and an annual budget of $120M. Spearheaded the city's green infrastructure initiative, completing 5 major projects under budget." },
        { role: "City Manager", company: "Evanston Municipality", dates: "2008 - 2016", description: "Overhauled the municipal procurement process, saving taxpayers $2.5M annually. Served as the primary liaison between city council and public agencies." }
      ],
      education: "Master of Public Administration (MPA), Syracuse University (2008)\nB.A. Political Science (2005)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { const newArray = [...data[arrayName]]; newArray[index][field] = value; setData(prev => ({ ...prev, [arrayName]: newArray })); };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`elite_draft_${data.lastName}`, JSON.stringify(data));
      setIsSaving(false);
    }, 8000); // Artificial delay for "Executive Processing" feel or remove for production
  };

  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Civic & Government",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `Executive_Director_${data.lastName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Executive Archiving Failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-black text-[#8B0000] tracking-widest uppercase text-xs">Executive Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-6 rounded-md text-white shadow-lg hover:brightness-110 transition-all font-bold" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Export Elite CV</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-24 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] tracking-tighter uppercase"><Landmark size={20}/> Director Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Current Command/Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Direct Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="HQ Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] uppercase tracking-tighter"><Award size={20}/> Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none bg-gray-50/50 leading-relaxed font-serif italic"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-black text-[#8B0000] uppercase tracking-tighter">
                        <h3 className="flex items-center gap-2"><Briefcase size={20}/> Service Record</h3>
                        <button onClick={addExperience} className="text-[10px] bg-[#8B0000] text-white px-3 py-1.5 rounded shadow-md hover:opacity-80 transition-opacity">Add Mandate</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-5 border-2 rounded-xl bg-gray-50/30 relative group border-gray-100">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Agency/Municipality" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates of Service" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] uppercase tracking-tighter"><Scale size={20}/> Competencies & Pedigree</h3>
                    <InputGroup label="Core Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education & Credentials" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: '"Georgia", serif' }}>
                    <div style={{ textAlign: 'center', padding: '50px 50px 20px', borderBottom: `3px double ${templateConfig.primaryColor}`, margin: '0 40px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            {data.firstName} <span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                        </h1>
                        <p style={{ fontSize: '15px', color: '#333', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>{data.title}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: '#555', backgroundColor: templateConfig.accentColor, padding: '8px', borderRadius: '2px' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>
                    <div style={{ padding: '30px 60px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Executive Summary</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#111', textAlign: 'justify' }}>{data.summary}</p>
                        </section>
                        <section style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '20px', letterSpacing: '1px' }}>Public Service History</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '600', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#222', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Competencies</h3>
                                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: '#111', lineHeight: '1.7' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                                </ul>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Education</h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#111', textAlign: 'center', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>
                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '40px', fontSize: '9px', color: '#888', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        OFFICIAL RECORD: {generatedCvNumber} • SEALED
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border-t-8 border-[#8B0000]">
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Executive Finalization</h3>
            <p className="text-sm text-gray-600 mb-6 italic">This will archive your directorship record into the high-security civic leadership database and generate your elite executive credentials.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs font-bold uppercase tracking-widest">Abort</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-5 py-2 rounded-lg text-white font-bold transition-all shadow-md text-xs uppercase tracking-widest" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Archiving..." : "Sync Official Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 text-slate-900">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center border-b-8 border-[#8B0000]">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Record Authenticated</h3>
            <p className="text-sm text-gray-600 mb-6 italic">Elite credentials generated. Your leadership profile is now synced with the public service registry.</p>
            <div className="bg-slate-50 border-2 border-double border-gray-200 p-6 rounded-xl mb-6">
               <div className="flex justify-center mb-2 text-[#8B0000]"><ShieldCheck size={40}/></div>
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-[5px] mb-1">Official ID</p>
               <p className="text-3xl font-black text-[#8B0000] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-lg text-white font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>Return to Command</button>
          </div>
        </div>
      )}
    </div>
  );
}