import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
    />
  </div>
);

export default function NursePractitionerEliteTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Nurse Practitioner Elite",
    primaryColor: "#7FBF7F", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Sarah",
      lastName: "Jenkins",
      title: "Family Nurse Practitioner (FNP-C)",
      email: "sarah.np@example.com",
      phone: "+1 (555) 234-5678",
      location: "Seattle, WA",
      summary: "Compassionate and board-certified Family Nurse Practitioner with 8+ years of clinical experience. Dedicated to holistic patient care, accurate diagnostics, and developing effective, evidence-based treatment plans for diverse patient populations.",
      skills: "Patient Assessment, Diagnostic Testing, EMR (Epic, Cerner), Preventive Care, Chronic Disease Management, BLS/ACLS Certified",
      experience: [
        { role: "Nurse Practitioner", company: "Seattle Family Clinic", dates: "2020 - Present", description: "Manage a panel of 800+ patients. Perform physical exams, order diagnostics, and prescribe medications. Improved patient satisfaction scores by 15%." },
        { role: "Registered Nurse - ER", company: "Mercy General Hospital", dates: "2015 - 2020", description: "Provided critical care in a Level 1 Trauma Center. Triaged patients and assisted physicians with emergency procedures." }
      ],
      education: "Master of Science in Nursing (MSN), University of Washington (2020)\nB.S. in Nursing, Seattle University (2015)"
    }
  };

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
      
      {/* TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}

                {generatedCvNumber || cvNumber ? "Update_Sync" : "Save_Draft"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity ${generatedCvNumber
                  ? "hover:opacity-90"
                  : "bg-slate-300 cursor-not-allowed opacity-50"
                  }`}
                style={{
                  backgroundColor: generatedCvNumber ? templateConfig.primaryColor : undefined
                }}
              >
                <Download className="w-4 h-4 mr-2" /> PDF_EXPORT
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Entry</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Facility/Hospital" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
                    <InputGroup label="Skills (separate with commas)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education (supports multiline)" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
                    
                    {/* Sidebar */}
                    <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: templateConfig.accentColor, padding: '40px 25px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: templateConfig.accentColor, color: templateConfig.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px' }}>
                                {data.firstName[0]}{data.lastName[0]}
                            </div>
                            <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</h2>
                        </div>
                        
                        <div style={{ marginBottom: '35px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14}/> <span style={{wordBreak: 'break-all'}}>{data.email}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14}/> {data.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14}/> {data.location}</div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.accentColor}`, paddingBottom: '5px', marginBottom: '10px' }}>Clinical Skills</h3>
                            <ul style={{ fontSize: '12px', paddingLeft: '15px', margin: 0, lineHeight: '1.8' }}>
                                {data.skills.split(',').map((skill, i) => <li key={i}>{skill.trim()}</li>)}
                            </ul>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `1px solid ${templateConfig.accentColor}`, paddingBottom: '5px', marginBottom: '10px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ width: '65%', padding: '40px 35px', color: '#333' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: '800', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', lineHeight: '1', margin: 0 }}>
                            {data.firstName} <br/> <span style={{color: '#333'}}>{data.lastName}</span>
                        </h1>

                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px' }}>Professional Summary</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '5px' }}>Professional Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        {generatedCvNumber && (
                            <div style={{ position: 'absolute', bottom: '15px', right: '25px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                CV ID: {generatedCvNumber} • Verification: resumea.com/cv/{generatedCvNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm shadow-inner text-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-green-600">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Save size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Record Synchronized</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-green-600/30 underline-offset-4 tracking-wide">
              Practitioner credentials successfully serialized and archived to the medical database.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 text-center">Reference ID</p>
              <p className="text-3xl font-black text-green-700 tracking-tighter text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-black uppercase shadow-xl hover:opacity-90 transition-all text-xs tracking-widest"
            >
              Return to Station
            </button>
          </div>
        </div>
      )}
    </div>
  );
}