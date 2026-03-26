import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Sparkles, Zap, Database } from 'lucide-react';

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

export default function CreativeDirectorEliteTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Creative Director Elite",
    primaryColor: "#2E004F", // Royal Deep Purple
    accentColor: "#D4FF00",  // Electric Lime
    defaultData: {
      firstName: "Julian",
      lastName: "Vance",
      title: "Executive Creative Director",
      email: "julian.vance@creative.agency",
      phone: "+1 (555) 987-6543",
      location: "New York, NY",
      summary: "Visionary Creative Director with 15+ years of experience leading multi-disciplinary teams in global ad agencies. Proven track record of conceptualizing and executing award-winning, 360-degree brand campaigns that drive cultural conversation and ROI.",
      skills: "Creative Direction, Brand Strategy, Art Direction, Team Leadership, Concept Development, Video Production, Adobe CC",
      experience: [
        { role: "Executive Creative Director", company: "Neon Media Group", dates: "2019 - Present", description: "Lead a department of 40+ designers, copywriters, and strategists. Spearheaded the global 'Future Now' campaign, resulting in a Cannes Lion Gold award." },
        { role: "Creative Director", company: "Ogilvy & Mather", dates: "2013 - 2019", description: "Directed creative strategy for Fortune 100 tech clients. Managed $10M+ annual production budgets." }
      ],
      education: "BFA in Design & Visual Communications, Parsons School of Design (2010)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
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
      const newCvNumber = await saveAndGeneratePDF(data);
      if (newCvNumber) {
        setGeneratedCvNumber(newCvNumber);
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
      a.remove();
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* ELITE TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-black hover:bg-slate-100 h-9 px-4 uppercase tracking-tighter border-2 border-slate-900 transition-all flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                </button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-700" />
                  <span className="font-black text-sm uppercase tracking-[0.3em]">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2" />
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
            
            {/* DIRECTOR'S INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-8">
                <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2"><Zap className="w-4 h-4" /> Personnel Specs</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Identity_First" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Identity_Last" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Executive_Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email_Access" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Direct_Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Operating_City" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2">Creative Vision</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 text-sm font-bold focus:ring-0 focus:outline-none border-b-4 border-purple-600 mt-2"/>
                </div>

                <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                     <div className="flex justify-between items-center mb-6 border-b-2 border-slate-900 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Production History</h3>
                        <button onClick={addExperience} className="text-[10px] bg-purple-900 text-white px-3 py-1 font-black uppercase tracking-tighter">+ New_Campaign</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 border-2 border-slate-100 bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role_Designation" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Agency_Firm" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Active_Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Focus on awards, ROI, and team leadership..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border-2 border-slate-200 p-3 text-sm font-bold mt-2 outline-none focus:border-purple-600"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2">Expertise Hub</h3>
                    <InputGroup label="Core Competencies" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-8"></div>
                    <InputGroup label="Credentials" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="h-full bg-slate-900 flex justify-center p-12 overflow-auto custom-scrollbar">
                <div 
                    id="resume-preview"
                    ref={previewRef} 
                    style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Hero Header */}
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '60px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', backgroundColor: templateConfig.accentColor, borderRadius: '50%', mixBlendMode: 'overlay', opacity: 0.4 }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h1 style={{ fontSize: '72px', fontWeight: '900', textTransform: 'uppercase', lineHeight: '0.8', margin: '0 0 15px 0', letterSpacing: '-3px' }}>
                                {data.firstName} <br/> <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ height: '2px', width: '50px', backgroundColor: templateConfig.accentColor }}></div>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '6px', textTransform: 'uppercase', color: '#fff' }}>
                                    {data.title}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* High-Contrast Contact Strip */}
                    <div style={{ backgroundColor: '#000', color: 'white', padding: '20px 60px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color={templateConfig.accentColor}/> {data.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color={templateConfig.accentColor}/> {data.phone}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} color={templateConfig.accentColor}/> {data.location}</span>
                    </div>

                    <div style={{ padding: '60px', display: 'flex', gap: '60px', flex: 1 }}>
                        
                        {/* Main Stream */}
                        <div style={{ flex: 1.8 }}>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Vision Statement <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                                </h3>
                                <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#111', fontWeight: '600', fontStyle: 'italic' }}>"{data.summary}"</p>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Key Engagements <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                                </h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '45px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#000', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#999', textTransform: 'uppercase', marginTop: '8px' }}>[{exp.dates}]</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '900', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div style={{ flex: 1 }}>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '25px' }}>Expertise</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', fontWeight: '900', color: '#111', borderLeft: `4px solid ${templateConfig.accentColor}`, paddingLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '25px' }}>Education</h3>
                                <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-line', fontWeight: '800', textTransform: 'uppercase' }}>{data.education}</p>
                            </section>

                            {generatedCvNumber && (
                                <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #eee' }}>
                                    <div style={{ fontSize: '9px', fontWeight: '900', color: '#ccc', textTransform: 'uppercase', marginBottom: '5px' }}>Elite Verification</div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', fontFamily: 'monospace' }}>#ID_{generatedCvNumber}</div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
      </div>



      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">
              Resume Saved Successfully
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Your latest resume has been uploaded and downloaded.
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-6">
              CV Number: {generatedCvNumber}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-5 py-2 rounded-lg text-white"
              style={{ backgroundColor: templateConfig.accentColor }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}