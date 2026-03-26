import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Pill } from 'lucide-react';

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

export default function ClinicalPharmacistModernTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Clinical Pharmacist Modern",
    primaryColor: "#7FBF7F", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "David",
      lastName: "Choi",
      title: "Clinical Pharmacist, PharmD",
      email: "david.choi@example.com",
      phone: "+1 555 111 2222",
      location: "San Diego, CA",
      summary: "Dedicated Clinical Pharmacist with expertise in pharmacotherapy, drug safety, and interdisciplinary patient care. Committed to optimizing medication regimens, minimizing adverse effects, and educating patients.",
      skills: "Pharmacotherapy, Medication Reconciliation, Epic Willow, IV Compounding, Patient Counseling, Regulatory Compliance",
      experience: [
        { role: "Clinical Pharmacist", company: "Pacific Coast Hospital", dates: "2019 - Present", description: "Review and verify 100+ daily medication orders for ICU and Med-Surg patients. Participate in daily rounds with attending physicians to optimize drug therapies." },
        { role: "Staff Pharmacist", company: "Community Health Rx", dates: "2016 - 2019", description: "Dispensed medications and provided comprehensive counseling to ambulatory patients. Managed inventory of controlled substances." }
      ],
      education: "Doctor of Pharmacy (PharmD), UC San Diego (2016)"
    }
  };

  const previewRef = useRef();
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
      {/* HEADERBAR */}
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

                {generatedCvNumber || cvNumber ? "Update" : "Save"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity ${generatedCvNumber
                  ? "hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
                style={{
                  backgroundColor: generatedCvNumber
                    ? templateConfig.primaryColor
                    : undefined
                }}
              >
                <Download className="w-4 h-4 mr-2" /> PDF_EXPORT
              </button>
            </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Personal Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>
                {/* ... Profile & Experience inputs remain same as your original snippet ... */}
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold">+ Add</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Facility" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
                    <InputGroup label="Skills" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ padding: '50px 50px 20px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '40px', fontWeight: '300', color: '#222', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: templateConfig.primaryColor }}>{data.firstName}</span> {data.lastName}
                        </h1>
                        <p style={{ fontSize: '15px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</p>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px', color: '#777' }}>
                            <span>{data.email}</span><span>{data.phone}</span><span>{data.location}</span>
                        </div>
                    </div>
                    <div style={{ width: '80%', height: '2px', backgroundColor: templateConfig.primaryColor, margin: '0 auto 30px' }}></div>
                    <div style={{ padding: '0 50px 50px' }}>
                        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#444', maxWidth: '90%', margin: '0 auto' }}>{data.summary}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '50px' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Core Skills</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#333', backgroundColor: '#f5f9f5', padding: '6px 12px', borderRadius: '4px', borderLeft: `3px solid ${templateConfig.primaryColor}` }}>{skill.trim()}</div>
                                    ))}
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', marginTop: '40px' }}>Education</h3>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px' }}>Experience</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '30px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{exp.role}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '500' }}>{exp.company}</span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>{exp.dates}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555' }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {generatedCvNumber && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '25px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {generatedCvNumber} • Verify at: resumea.com/cv/{generatedCvNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl text-center border-t-8 border-green-500">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Pill size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Regimen Secured</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium italic underline decoration-green-500/30 underline-offset-4 tracking-wide">
              Clinical credentials successfully serialized and archived to the medical database.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 text-center">Batch ID</p>
              <p className="text-3xl font-black text-green-700 tracking-tighter text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 text-xs"
              style={{ backgroundColor: templateConfig.primaryColor }}
            >
              Back to Station
            </button>
          </div>
        </div>
      )}
    </div>
  );
}