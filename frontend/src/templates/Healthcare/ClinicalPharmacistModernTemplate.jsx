import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
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

export default function ClinicalPharmacistModernTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
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

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };

  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  const saveResumeLocal = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`resume_${templateConfig.name}`, JSON.stringify(data));
      setIsSaving(false);
    }, 1000);
  };

  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Save metadata to DB
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Healthcare and Medical",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. Local PDF Generation
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollX: 0, scrollY: -window.scrollY },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output('blob');

      // 3. Upload PDF file
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Finalize
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Download process failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
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
                <button onClick={saveResumeLocal} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90" style={{ backgroundColor: templateConfig.primaryColor }}>
                    {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
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
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Resume?</h3>
            <p className="text-sm text-gray-600 mb-6">This will update your record on our server and generate the latest PDF version.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white disabled:opacity-70" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Generating..." : "Yes, Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">Saved Successfully</h3>
            <p className="text-sm text-gray-600 mb-6">Your resume has been processed. ID: <strong>{generatedCvNumber}</strong></p>
            <button onClick={() => setShowSuccessModal(false)} className="px-8 py-2 rounded-lg text-white" style={{ backgroundColor: templateConfig.primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}