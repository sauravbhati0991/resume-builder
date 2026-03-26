import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Target, Trophy, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
    />
  </div>
);

export default function SalesExecutiveProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Sales Executive Pro",
    primaryColor: "#E63946", // Aggressive Professional Red
    accentColor: "#FFD700",  // Gold for "Winning"
    defaultData: {
      firstName: "Marcus",
      lastName: "Wright",
      title: "Senior Sales Executive",
      email: "marcus.sales@example.com",
      phone: "(555) 123-9876",
      location: "Chicago, IL",
      summary: "High-energy Sales Executive with a relentless drive for crushing quotas and expanding market presence. Specialized in enterprise B2B SaaS sales, complex contract negotiations, and cultivating long-term C-level relationships.",
      skills: "Enterprise Sales, Consultative Selling, Salesforce/CRM, Pipeline Management, Contract Negotiation, Cold Calling, Presentation",
      experience: [
        { role: "Senior Account Executive", company: "CloudSphere Tech", dates: "2019 - Present", description: "Consistently exceeded annual sales quota of $2M by at least 120%. Closed the largest single contract in company history ($850k). Mentored 3 junior reps." },
        { role: "Sales Representative", company: "Innovate Software", dates: "2015 - 2019", description: "Generated 150+ qualified leads monthly through strategic outbound prospecting. Awarded 'Salesperson of the Year' in 2018." }
      ],
      education: "B.S. in Business Administration, University of Illinois (2015)"
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* SALES COMMAND CENTER (TOOLBAR) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-md rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-bold hover:bg-slate-100 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  <span className="font-black text-slate-800 uppercase tracking-tighter italic">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center text-sm font-bold h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition-all font-bold"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {generatedCvNumber || cvNumber ? "Update_Registry" : "Sync_on_Save"}
                </button>
                <button
                    onClick={() => handlePdfDownload(generatedCvNumber)}
                    disabled={!generatedCvNumber}
                    className={`inline-flex items-center justify-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-lg transition-all active:scale-95 ${generatedCvNumber
                        ? "hover:brightness-110"
                        : "bg-slate-300 cursor-not-allowed opacity-50"
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
            
            {/* INPUT PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-tight italic"><Target className="w-4 h-4 text-red-600" /> Lead Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Professional Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Direct Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Mobile" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Market/Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-black mb-4 uppercase tracking-tight text-slate-800 italic">Elevator Pitch</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none leading-relaxed bg-slate-50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-md font-black uppercase tracking-tight text-slate-800 italic">Track Record</h3><button onClick={addExperience} className="text-sm text-red-600 font-bold hover:underline">+ Add Experience</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Company" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} placeholder="Focus on quotas, %, and revenue..." onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-black mb-4 uppercase tracking-tight text-slate-800 italic">Arsenal & Credentials</h3>
                    <InputGroup label="Sales Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', position: 'relative' }}>
                    
                    {/* Dark Power Sidebar */}
                    <div style={{ width: '32%', backgroundColor: '#1a1a1a', color: 'white', padding: '40px 25px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: templateConfig.primaryColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', marginBottom: '30px', transform: 'rotate(-3deg)', boxShadow: '4px 4px 0px #FFD700' }}>
                            {data.firstName[0]}{data.lastName[0]}
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Direct Contact</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.9 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={14} color={templateConfig.accentColor}/> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={14} color={templateConfig.accentColor}/> {data.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={14} color={templateConfig.accentColor}/> {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Sales Arsenal</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#eee', padding: '8px 12px', borderLeft: `3px solid ${templateConfig.accentColor}`, fontWeight: '600' }}>
                                        {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Education</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.5', opacity: 0.8, margin: 0 }}>{data.education}</p>
                        </div>
                    </div>

                    {/* High-Impact Main Content */}
                    <div style={{ width: '68%', padding: '45px' }}>
                        <div style={{ marginBottom: '35px', borderLeft: `10px solid ${templateConfig.primaryColor}`, paddingLeft: '25px' }}>
                            <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#111', textTransform: 'uppercase', lineHeight: '0.9', margin: '0 0 8px 0', letterSpacing: '-2px' }}>{data.firstName} <br/><span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span></h1>
                            <h2 style={{ fontSize: '18px', color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>{data.title}</h2>
                        </div>

                        <section style={{ marginBottom: '40px' }}>
                            <div style={{ padding: '25px', backgroundColor: '#fff', border: `1px solid #eee`, borderTop: `4px solid ${templateConfig.accentColor}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#333', margin: 0, fontWeight: '500', fontStyle: 'italic' }}>"{data.summary}"</p>
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ padding: '4px 8px', backgroundColor: '#111', color: 'white', fontSize: '12px' }}>01</span> Professional Track Record
                            </h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '17px', fontWeight: '800', color: templateConfig.primaryColor, margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#999', textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#111', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    {/* Sales ID Digital Verification */}
                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '30px', fontSize: '9px', color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '1px' }}>
                        SALES_RECORD_ID: {generatedCvNumber} • VERIFY AT RESUMEA.COM
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-t-8" style={{ borderColor: templateConfig.primaryColor }}>
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
              <CheckCircle2 size={32}/>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase">Quota Crushed</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Record archived and trackable. Your unique Sales ID is:</p>
            <div className="bg-slate-900 py-3 rounded-lg font-mono font-bold text-red-500 mb-6 tracking-widest text-lg border-2 border-slate-800 shadow-inner">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-xl text-white font-black italic uppercase shadow-lg hover:opacity-90 transition-all active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>
              Back to Arsenal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}