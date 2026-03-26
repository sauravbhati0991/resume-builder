import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Video, Layers, Music, Monitor, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-sm focus:outline-none focus:border-purple-600 transition-all font-bold text-slate-800" 
    />
  </div>
);

export default function MultimediaDesignerPortfolioTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Multimedia Designer Portfolio",
    primaryColor: "#4F46E5", // Indigo Studio
    accentColor: "#A5B4FC",  // Soft Lavender
    defaultData: {
      firstName: "Kevin",
      lastName: "Chen",
      title: "Multimedia Designer & Animator",
      email: "k.chen@multimedia.com",
      phone: "+1 555 111 2233",
      location: "Seattle, WA",
      summary: "Versatile Multimedia Designer specializing in 2D/3D animation, video editing, and interactive web graphics. Passionate about merging sound, motion, and design to create immersive digital experiences.",
      skills: "After Effects, Premiere Pro, Cinema 4D, Illustrator, Sound Design, HTML5, CSS3, Storyboarding",
      experience: [
        { role: "Motion Graphics Designer", company: "Pulse Studios", dates: "2020 - Present", description: "Create animated explainer videos and social media content for tech clients. Increased average viewer retention time by 35% through dynamic storytelling and custom soundscapes." },
        { role: "Video Editor", company: "Broadcast Media LLC", dates: "2016 - 2020", description: "Edited short-form commercial content and corporate interviews. Handled color grading, audio mixing, and visual effects for final delivery." }
      ],
      education: "BFA in Digital Arts & Animation, Cornish College of the Arts (2016)"
    }
  };

  // MASTER PATTERN STATE
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

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
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* STUDIO RENDER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-2 border-slate-200 shadow-xl rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase tracking-tighter border-2 border-slate-100 rounded-lg transition-all flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_STUDIO
                </button>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" />
                  <span className="font-black text-sm uppercase tracking-widest">{templateConfig.name}</span>
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
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-4">
            
            {/* EDITOR CONTROLS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-indigo-600 uppercase tracking-widest border-b-2 border-slate-50 pb-2"><Monitor className="w-4 h-4" /> Source Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Display_First" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Display_Last" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Creative_Designation" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Inbound_Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact_Signal" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Studio_Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-indigo-600 border-b-2 border-slate-50 pb-2">Creative Profile</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:outline-none border-2 border-slate-100 mt-2"/>
                </div>

                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b-2 border-slate-50 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Production Timeline</h3>
                        <button onClick={addExperience} className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 font-black rounded-full uppercase tracking-tighter border border-indigo-100 hover:bg-indigo-100 transition-colors">+ Add_Keyframe</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded-xl border-2 border-slate-50 bg-white relative group shadow-sm">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Production_Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Studio_Agency" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe software used and project outcomes..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border-2 border-slate-100 rounded-xl p-3 text-sm font-medium mt-2 outline-none focus:border-indigo-200 transition-colors"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-indigo-600 border-b-2 border-slate-50 pb-2">Software Stack</h3>
                    <InputGroup label="Primary_Tools" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-8"></div>
                    <InputGroup label="Academic_Degree" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            <div className="h-full bg-slate-200 flex justify-center p-12 overflow-auto custom-scrollbar rounded-2xl border-4 border-dashed border-slate-300">
                <div 
                    id="resume-preview"
                    ref={previewRef} 
                    style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '60px', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: `radial-gradient(circle, ${templateConfig.primaryColor} 0%, transparent 70%)`, opacity: 0.4 }}></div>
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '-2px', lineHeight: '0.9', margin: 0 }}>
                                {data.firstName}<br/>
                                <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ display: 'inline-block', marginTop: '20px', padding: '6px 15px', backgroundColor: templateConfig.primaryColor, color: 'white', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '4px' }}>
                                {data.title}
                            </div>
                        </div>
                        
                        <div style={{ position: 'absolute', bottom: '40px', right: '60px', textAlign: 'right', color: '#94a3b8', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.8' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ height: '8px', width: '100%', background: `linear-gradient(to right, ${templateConfig.primaryColor}, ${templateConfig.accentColor}, #0f172a)` }}></div>

                    <div style={{ padding: '50px 60px', flex: 1, display: 'flex', gap: '50px' }}>
                        <div style={{ flex: 1.8 }}>
                            <section style={{ marginBottom: '45px' }}>
                                <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', fontWeight: '500', fontStyle: 'italic', borderLeft: `4px solid ${templateConfig.accentColor}`, paddingLeft: '20px' }}>
                                    "{data.summary}"
                                </p>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Layers size={14} /> Production_Experience
                                </h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '40px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: templateConfig.primaryColor, marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                                        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>

                        <div style={{ flex: 1 }}>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px' }}>
                                    Tech_Stack
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: templateConfig.accentColor }}></div>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px' }}>
                                    Credentials
                                </h3>
                                <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>
                                    {data.education}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div style={{ padding: '30px 60px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                           <Video size={14} color="#94a3b8" />
                           <Music size={14} color="#94a3b8" />
                           <Monitor size={14} color="#94a3b8" />
                        </div>
                        {generatedCvNumber && (
                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#cbd5e1', fontFamily: 'monospace' }}>
                                MASTER_RENDER_VER_2.6 // PROJECT_ID: {generatedCvNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>



      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-b-[12px] border-indigo-600">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Export Successful</h3>
            <p className="text-sm text-slate-400 mb-8 font-medium italic">Project Serial ID issued:</p>
            <div className="bg-slate-50 py-4 rounded-xl font-mono font-bold text-indigo-600 mb-8 tracking-[0.2em] text-xl border-2 border-indigo-50 shadow-sm">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-[0.2em] bg-slate-900">
              Back to Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}