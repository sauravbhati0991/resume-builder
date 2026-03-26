import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Microscope, BookOpen, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]" />
  </div>
);

export default function ResearchScientistExpertTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Research Scientist Expert",
    primaryColor: "#008080", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Dr. Elena",
      lastName: "Rosov",
      title: "Principal Research Scientist",
      email: "e.rosov@institute.edu",
      phone: "+1 555 606 7070",
      location: "Bethesda, MD",
      summary: "Principal Research Scientist with 12+ years of post-doctoral experience leading oncology clinical trials. Extensively published author in peer-reviewed journals (Nature, Cell). Expert in securing NIH grants and directing multi-disciplinary research teams to advance translational medicine.",
      skills: "Translational Medicine, Grant Writing, Clinical Trial Design, Flow Cytometry, In Vivo Modeling, Academic Publishing, Cross-functional Leadership",
      experience: [
        { role: "Principal Investigator", company: "National Institutes of Health (NIH)", dates: "2016 - Present", description: "Lead a lab of 15 researchers focused on targeted immunotherapy. Secured $3.5M in federal grant funding. Published 8 primary-author papers in Tier 1 journals." },
        { role: "Post-Doctoral Fellow", company: "Johns Hopkins Medicine", dates: "2012 - 2016", description: "Conducted exhaustive in-vivo studies on cellular apoptosis. Presented findings at 4 international oncology conferences." }
      ],
      education: "Ph.D. in Cellular Biology, Harvard University (2012)\nB.S. Biology, Magna Cum Laude (2007)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { const newArray = [...data[arrayName]]; newArray[index][field] = value; setData(prev => ({ ...prev, [arrayName]: newArray })); };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const cvNumber = await saveAndGeneratePDF(data);
      if (cvNumber) {
        setGeneratedCvNumber(cvNumber);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePdfDownload = async (cvNumber) => {
    try {
      const res = await api.get(`/resumes/view/${cvNumber}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-bold text-[#008080] tracking-wide uppercase text-xs">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all text-xs font-black uppercase tracking-widest"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2 text-[#008080]" />
                    )}
                    {generatedCvNumber || cvNumber ? "Update_Registry" : "Sync_on_Save"}
                </button>
                <button
                    onClick={() => handlePdfDownload(generatedCvNumber)}
                    disabled={!generatedCvNumber}
                    className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 text-xs font-black uppercase tracking-widest ${generatedCvNumber
                        ? "hover:opacity-90"
                        : "bg-gray-300 cursor-not-allowed opacity-50"
                        }`}
                    style={{ backgroundColor: generatedCvNumber ? templateConfig.primaryColor : undefined }}
                >
                    <Download className="w-4 h-4 mr-2" /> REPOSITORY_EXPORT
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Microscope size={20} className="text-[#008080]"/> Investigator Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Principal Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Research Hub" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-[#008080]"/> Executive Abstract</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-[#008080] outline-none bg-slate-50/50 italic"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-bold">
                        <h3>Clinical & Academic History</h3>
                        <button onClick={addExperience} className="text-xs bg-[#008080] text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-all">+ Add Record</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-xl bg-gray-50/30 relative group border-dashed border-gray-300">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Position" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Institution" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#008080] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-[#008080]"/> Expertise & Pedigree</h3>
                    <InputGroup label="Methodologies (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic Degrees" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: '"Georgia", serif' }}>
                    
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', margin: '30px 40px', padding: '30px', textAlign: 'center', borderRadius: '2px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            {data.firstName} {data.lastName}
                        </h1>
                        <p style={{ fontSize: '13px', fontWeight: 'normal', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>{data.title}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: '#E5E7EB' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '10px 40px 40px', flex: 1 }}>
                        <section style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '10px' }}>Abstract</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#222', textAlign: 'justify' }}>{data.summary}</p>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Academic History</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '6px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#333', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>

                            <div>
                                <section style={{ marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Expertise</h3>
                                    <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '11px', color: '#222', lineHeight: '1.8' }}>
                                        {data.skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                                    </ul>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Education</h3>
                                    <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#222', whiteSpace: 'pre-line' }}>{data.education}</p>
                                </section>
                            </div>
                        </div>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', textAlign: 'center', fontSize: '9px', color: '#999', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        SEQ ID: {generatedCvNumber} • PEER-REVIEWED-DOC
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-b-8 border-[#008080]">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-teal-100">
               <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-slate-900 italic">Protocol Success</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">Investigator record archived in the Central Bioinformatics Database. ID:</p>
            <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl mb-8 shadow-inner overflow-hidden flex flex-col items-center">
               <p className="text-[10px] text-teal-500 uppercase font-black tracking-[0.4em] mb-2">Archive Reference</p>
               <p className="text-3xl font-black text-teal-400 font-mono tracking-tighter uppercase">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>Acknowledge Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
}