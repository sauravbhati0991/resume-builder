import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2 } from 'lucide-react';

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

export default function PhysicalTherapistProTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();
  
  const templateConfig = {
    name: "Physical Therapist Pro",
    primaryColor: "#7FBF7F", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Michael",
      lastName: "Chang",
      title: "Doctor of Physical Therapy (DPT)",
      email: "m.chang@example.com",
      phone: "+1 555 444 3333",
      location: "Denver, CO",
      summary: "Licensed Physical Therapist specializing in orthopedic and sports rehabilitation. Proven ability to design individualized treatment plans that restore mobility, reduce pain, and improve overall quality of life for patients of all ages.",
      skills: "Orthopedic Rehab, Manual Therapy, Kinesio Taping, Post-Surgical Recovery, Patient Education, EMR Documentation",
      experience: [
        { role: "Lead Physical Therapist", company: "Denver Sports Rehab", dates: "2019 - Present", description: "Manage a caseload of 15+ patients daily. Develop comprehensive care plans for post-operative ACL and rotator cuff repairs." },
        { role: "Physical Therapist", company: "Summit Physical Therapy", dates: "2016 - 2019", description: "Conducted mobility assessments and administered therapeutic exercises for geriatric patients." }
      ],
      education: "Doctor of Physical Therapy (DPT), University of Colorado (2016)\nB.S. in Kinesiology (2013)"
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

      // 1. Persist metadata to DB
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

      // 3. Upload PDF for verification storage
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Download and show success
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Download workflow failed:", err);
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
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.primaryColor }}>
                    {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* EDITOR */}
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
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Clinic</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Clinic/Hospital" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
                    <InputGroup label="Specialized Skills" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* Split Header */}
                    <div style={{ display: 'flex', borderBottom: `5px solid ${templateConfig.primaryColor}` }}>
                        <div style={{ flex: 2, padding: '40px 30px 30px 50px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#222', margin: '0 0 5px 0' }}>{data.firstName} <span style={{color: templateConfig.primaryColor}}>{data.lastName}</span></h1>
                            <p style={{ fontSize: '16px', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>{data.title}</p>
                        </div>
                        <div style={{ flex: 1, backgroundColor: templateConfig.primaryColor, color: templateConfig.accentColor, padding: '40px 30px', fontSize: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ padding: '40px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', textTransform: 'uppercase', marginBottom: '10px' }}>Professional Profile</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', textTransform: 'uppercase', marginBottom: '20px' }}>Clinical Experience</h3>
                            <div style={{ borderLeft: `2px solid ${templateConfig.primaryColor}`, paddingLeft: '20px', marginLeft: '10px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '25px', position: 'relative' }}>
                                        {/* Timeline Dot */}
                                        <div style={{ position: 'absolute', width: '12px', height: '12px', backgroundColor: templateConfig.primaryColor, borderRadius: '50%', left: '-27px', top: '2px' }}></div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '12px', color: '#777', fontWeight: 'bold' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#555', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', textTransform: 'uppercase', marginBottom: '15px' }}>Specialized Skills</h3>
                                <ul style={{ fontSize: '13px', color: '#555', paddingLeft: '15px', lineHeight: '1.6' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                                </ul>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                                <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </div>
                        </div>
                    </div>
                    {generatedCvNumber && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '25px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {generatedCvNumber} • Verification: resumea.com/cv/{generatedCvNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Professional CV?</h3>
            <p className="text-sm text-gray-600 mb-6">This will update your profile on the secure server and refresh the PDF with a unique ID for employer verification.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-70" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Saving..." : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resume Verified & Saved</h3>
            <p className="text-sm text-gray-600 mb-4">Your CV has been assigned a permanent ID:</p>
            <div className="bg-gray-100 py-2 px-4 rounded-lg font-mono text-sm font-bold text-gray-700 mb-6">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-2 rounded-lg text-white font-bold" style={{ backgroundColor: templateConfig.primaryColor }}>Return to Builder</button>
          </div>
        </div>
      )}
    </div>
  );
}