import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, BookOpen, BarChart, PenTool, Globe, Database } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
    />
  </div>
);

export default function ContentStrategyProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Content Strategy Pro",
    primaryColor: "#4A1D96", // Deep Editorial Purple
    accentColor: "#FDE047",  // Highlighter Yellow
    defaultData: {
      firstName: "Rachel",
      lastName: "Gomez",
      title: "Lead Content Strategist",
      email: "rachel.content@example.com",
      phone: "+1 555 888 9999",
      location: "Austin, TX",
      summary: "Strategic storyteller and content architect. I specialize in building scalable content ecosystems that drive organic traffic, foster community engagement, and align with core brand narratives across B2B and B2C sectors.",
      skills: "Content Strategy, SEO Copywriting, Editorial Calendars, Brand Voice, CMS Management, Content Audits, Google Analytics",
      experience: [
        { role: "Lead Content Strategist", company: "Digital Narrative Agency", dates: "2019 - Present", description: "Developed and executed a content strategy for a SaaS client that increased organic blog traffic by 150% in 6 months. Manage a team of 5 freelance writers and established quarterly content audits." },
        { role: "Senior Copywriter", company: "Tech Innovations", dates: "2015 - 2019", description: "Authored whitepapers, case studies, and email drip campaigns. Established the company's first comprehensive style guide and reduced bounce rates by 22%." }
      ],
      education: "B.A. in English & Journalism, UT Austin (2015)"
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* EDITORIAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-100 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> EXIT</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">{templateConfig.name}</span>
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
            
            {/* CONTENT EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mt-4">
                    <h3 className="text-xs font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-widest border-b pb-2">Author Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Headline Role" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Current Base" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Mission Statement</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none leading-relaxed bg-slate-50 font-sans"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Editorial History</h3><button onClick={addExperience} className="text-xs text-purple-600 font-bold hover:underline tracking-tight">+ Add Role</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role Title" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Date Range" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Focus on metrics: traffic growth, lead gen, conversion..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Knowledge Base</h3>
                    <InputGroup label="Strategic Expertise" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* STRATEGY PREVIEW */}
            <div className="h-full bg-stone-200 flex justify-center p-12 overflow-auto custom-scrollbar">
                <div 
                    id="resume-preview"
                    ref={previewRef} 
                    style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    {/* Editorial Sidebar */}
                    <div style={{ width: '38%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '45px 35px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <h1 style={{ fontSize: '38px', fontWeight: '900', lineHeight: '1', margin: 0, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                                {data.firstName}<br/>
                                <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ width: '40px', height: '4px', backgroundColor: templateConfig.accentColor, marginTop: '20px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#d8b4fe', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={14}/> Distribution
                            </h3>
                            <div style={{ fontSize: '12px', color: '#e9d5ff', display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: '500' }}>
                                <div>{data.email}</div>
                                <div>{data.phone}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart size={14}/> Expertise
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', color: 'white', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontWeight: '600' }}>
                                        {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={14}/> Academy
                            </h3>
                            <p style={{ fontSize: '11px', color: '#e9d5ff', lineHeight: '1.7', whiteSpace: 'pre-line', fontWeight: '500' }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ width: '62%', padding: '50px 45px', display: 'flex', flexDirection: 'column' }}>
                        
                        <section style={{ marginBottom: '50px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b4b', position: 'relative', display: 'inline-block' }}>
                                    <span style={{ position: 'relative', zIndex: 1 }}>Mission Summary</span>
                                    <span style={{ position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '10px', backgroundColor: templateConfig.accentColor, zIndex: 0, opacity: 0.8 }}></span>
                                </h3>
                            </div>
                            <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#334155', margin: 0, fontWeight: '500' }}>{data.summary}</p>
                        </section>

                        <section style={{ flex: 1 }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b4b', position: 'relative', display: 'inline-block' }}>
                                    <span style={{ position: 'relative', zIndex: 1 }}>Content Architecture</span>
                                    <span style={{ position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '10px', backgroundColor: templateConfig.accentColor, zIndex: 0, opacity: 0.8 }}></span>
                                </h3>
                            </div>
                            
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '2px', height: '100%', backgroundColor: '#f1f5f9' }}></div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: templateConfig.primaryColor, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{exp.company}</span>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        {/* Narrative Verification Footer */}
                        {generatedCvNumber && (
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '9px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '2px' }}>Indexing Narrative Assets // {new Date().getFullYear()}</span>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', fontFamily: 'monospace' }}>REF_{generatedCvNumber}</span>
                            </div>
                        )}
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