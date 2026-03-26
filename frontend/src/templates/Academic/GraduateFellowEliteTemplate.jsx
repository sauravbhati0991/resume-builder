import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Microscope, GraduationCap, ShieldCheck, FileCheck, User
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81] transition-all" 
    />
  </div>
);

export default function GraduateFellowEliteTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Graduate Fellow Elite",
    primaryColor: "#312e81", 
    accentColor: "#eef2ff",  
    defaultData: {
      firstName: "Michael",
      lastName: "Chang",
      title: "NSF Graduate Research Fellow",
      email: "m.chang@grad.edu",
      phone: "+1 555 404 5050",
      location: "Ann Arbor, MI",
      summary: "Highly motivated Graduate Research Fellow studying applied machine learning in structural engineering. Recipient of the National Science Foundation (NSF) Fellowship. Experienced in leading undergraduate research teams and assisting in grant proposal preparation.",
      skills: "Machine Learning (PyTorch, TensorFlow), Structural Analysis, Data Visualization, Academic Writing, Statistical Modeling, Lecturing",
      experience: [
        { role: "Graduate Research Assistant", company: "University of Michigan", dates: "2021 - Present", description: "Design machine learning models to predict structural fatigue in concrete. Supervise 3 undergraduate researchers in data collection and coding." },
        { role: "Engineering Intern", company: "BuildTech Solutions", dates: "2019 - 2021", description: "Assisted senior engineers in drafting CAD models for commercial buildings. Conducted material stress tests." }
      ],
      education: "M.S. Structural Engineering, Univ. of Michigan (Exp. 2024)\nB.S. Civil Engineering (2021)"
    }
  };

  // State Management
  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [zoom, setZoom] = useState(0.8);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
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
    <div className="min-h-screen w-full bg-[#fcfcfd] flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"><ArrowLeft size={18} /></button>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                    <Microscope size={20} className="text-[#312e81]"/>
                    <span className="font-bold text-slate-700 tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save className="mr-2" />
                )}

                {generatedCvNumber || cvNumber ? "Update" : "Save"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md ${generatedCvNumber
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <Download className="mr-2" /> PDF
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* EDITOR SIDE */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <User size={16}/> Scholar Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Fellowship Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Academic Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Institution Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-4">Research Objective</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#312e81] outline-none bg-slate-50/30 leading-relaxed"/>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em]">Academic Experience</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold bg-[#312e81] text-white px-3 py-1.5 rounded uppercase tracking-widest">+ Add Record</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role / Assistantship" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Lab / Institution" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Tenure Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#312e81] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-4">Methodology & Education</h3>
                    <InputGroup label="Core Skills / Lab Techniques" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW SIDE */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div 
                    id="resume-preview"
                    ref={previewRef} 
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm', 
                        backgroundColor: 'white', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        position: 'relative',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}
                >
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 50px', borderBottom: `8px solid ${templateConfig.accentColor}` }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '16px', color: templateConfig.accentColor, fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{data.title}</h2>
                        
                        <div style={{ display: 'flex', gap: '20px', marginTop: '25px', fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '45px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Research Statement</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155', textAlign: 'justify' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Academic & Professional Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: templateConfig.primaryColor, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Methodology & Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data.skills.split(',').map((s, i) => (
                                        <span key={i} style={{ fontSize: '11px', color: '#334155', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '3px', fontWeight: '600' }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Education</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '20px', left: '50px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        FELLOWSHIP-ID: {generatedCvNumber} • RESUMEA ACADEMIC REPOSITORY
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center border-t-8 border-[#312e81]">
            <div className="w-20 h-20 bg-blue-50 text-[#312e81] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">CV VERIFIED</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-[#312e81]/30 underline-offset-4">Academic credentials successfully archived.</p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Scholar ID</p>
               <p className="text-3xl font-black text-[#312e81] tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl bg-[#312e81] text-white font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#252361] transition-all">Continue Research</button>
          </div>
        </div>
      )}
    </div>
  );
}
