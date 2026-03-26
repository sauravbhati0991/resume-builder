import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
    />
  </div>
);

export default function DigitalGrowthProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Digital Growth Pro",
    primaryColor: "#FF4500", // Growth Red
    accentColor: "#FFD700",  // Success Gold
    defaultData: {
      firstName: "Elias",
      lastName: "Kovac",
      title: "Growth Marketing Manager",
      email: "elias.growth@example.com",
      phone: "+1 555 432 1098",
      location: "Austin, TX",
      summary: "Performance-oriented Growth Marketer focused on rapid scaling and user acquisition. Specializes in A/B testing, funnel optimization, and leveraging analytics to drive sustainable MoM revenue growth.",
      skills: "Performance Marketing, SEO/SEM, Google Analytics, Conversion Rate Optimization (CRO), A/B Testing, Lifecycle Marketing",
      experience: [
        { role: "Growth Marketing Manager", company: "FinTech App", dates: "2021 - Present", description: "Scaled user base from 10k to 250k Active Users in 18 months. Lowered Customer Acquisition Cost (CAC) by 35% through rigorous landing page optimization." },
        { role: "Digital Marketing Specialist", company: "E-Comm Direct", dates: "2017 - 2021", description: "Managed paid social campaigns across Meta and TikTok. Generated $1.2M in attributed revenue through email lifecycle campaigns." }
      ],
      education: "B.S. in Economics & Marketing, University of Texas (2017)"
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
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2 text-indigo-600" />
                    )}
                    {generatedCvNumber || cvNumber ? "Update_Registry" : "Sync_on_Save"}
                </button>
                <button
                    onClick={() => handlePdfDownload(generatedCvNumber)}
                    disabled={!generatedCvNumber}
                    className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 ${generatedCvNumber
                        ? "hover:opacity-90"
                        : "bg-gray-300 cursor-not-allowed opacity-50"
                        }`}
                    style={{ backgroundColor: generatedCvNumber ? templateConfig.primaryColor : undefined }}
                >
                    <Download className="w-4 h-4 mr-2" /> PORTFOLIO_EXPORT
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* LEFT: EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="text-orange-500 w-5 h-5"/> Contact & Core Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Growth Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>
                {/* Textarea inputs for summary and experience */}
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Growth Thesis (Summary)</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold flex items-center gap-2">Campaign History</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Entry</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Company" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Stack & Credentials</h3>
                    <InputGroup label="Marketing Stack (SEO, SEM, etc.)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ display: 'flex', height: '140px' }}>
                        <div style={{ flex: '3', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '30px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{data.firstName} {data.lastName}</h1>
                            <h2 style={{ fontSize: '16px', color: templateConfig.accentColor, fontWeight: 'bold', margin: 0 }}>{data.title}</h2>
                        </div>
                        <div style={{ flex: '2', backgroundColor: '#111', color: 'white', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '11px', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} color={templateConfig.accentColor}/> {data.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} color={templateConfig.accentColor}/> {data.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} color={templateConfig.accentColor}/> {data.location}</div>
                        </div>
                    </div>

                    <div style={{ padding: '40px', flex: 1, display: 'flex', gap: '40px' }}>
                        <div style={{ flex: 1 }}>
                            <section style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px', borderBottom: `2px solid ${templateConfig.accentColor}`, display: 'inline-block' }}>Growth Profile</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', textAlign: 'justify', marginTop: '10px' }}>{data.summary}</p>
                            </section>

                            <section style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Performance History</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '25px', paddingLeft: '15px', borderLeft: `3px solid ${templateConfig.accentColor}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor, marginBottom: '8px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>

                            <div style={{ display: 'flex', gap: '30px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px' }}>Growth Stack</h3>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.skills}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px' }}>Education</h3>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '30px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        GROWTH_ID: {generatedCvNumber} • VERIFY: resumea.com/cv/{generatedCvNumber}
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border-t-8 border-orange-500">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-orange-100">
              <CheckCircle2 size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Growth Synchronized</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Your performance record has been serialized and secured. ID:</p>
            <div className="bg-slate-900 py-4 px-6 rounded-2xl font-mono font-bold text-orange-400 mb-8 tracking-[0.2em] text-xl shadow-inner border-2 border-slate-800">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>
              Return to Pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}