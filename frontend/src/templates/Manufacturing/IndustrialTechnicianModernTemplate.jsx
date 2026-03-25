import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7410E]" />
  </div>
);

export default function IndustrialTechnicianModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Industrial Technician Modern",
    primaryColor: "#B7410E", 
    accentColor: "#2F4F4F",  
    defaultData: {
      firstName: "Samuel",
      lastName: "Jenkins",
      title: "Lead Industrial Technician",
      email: "samuel.j@technician.com",
      phone: "+1 555 777 9999",
      location: "Atlanta, GA",
      summary: "Tech-savvy Industrial Technician experienced in PLC programming, robotic cell calibration, and advanced electromechanical troubleshooting. Focused on optimizing machine output and reducing calibration errors in high-volume production plants.",
      skills: "PLC Programming (Allen-Bradley), Robotics Calibration, Electromechanical Repair, Autocad, Preventive Maintenance, System Diagnostics",
      experience: [
        { role: "Senior Production Technician", company: "RoboTech Assembly", dates: "2018 - Present", description: "Program and troubleshoot 20+ automated robotic assembly arms. Restored production line efficiency, increasing daily output by 12%." },
        { role: "Electromechanical Technician", company: "Precision Parts Corp", dates: "2013 - 2018", description: "Calibrated CNC machines and ensured tight tolerances were met. Assisted engineers in the installation of new automation lines." }
      ],
      education: "A.S. Electromechanical Technology, Georgia Tech (2013)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { const newArray = [...data[arrayName]]; newArray[index][field] = value; setData(prev => ({ ...prev, [arrayName]: newArray })); };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`resume_${templateConfig.name}`, JSON.stringify(data));
      setIsSaving(false);
    }, 1000);
  };

  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Industrial",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 3, 
            useCORS: true, 
            letterRendering: true,
            scrollX: 0,
            scrollY: -window.scrollY 
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Critical: Industrial sync failed", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = async () => {
    setShowReplaceModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
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
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-[#B7410E]"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold">+ Add</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Company" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#B7410E]"/>
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
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ padding: '50px 50px 20px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '16px', color: templateConfig.primaryColor, fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>{data.title}</h2>
                        <div style={{ marginTop: '15px', fontSize: '13px', color: '#666', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '20px 50px', flex: 1 }}>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderTop: `3px solid ${templateConfig.primaryColor}`, marginBottom: '30px' }}>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333', textAlign: 'justify', margin: 0 }}>{data.summary}</p>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '20px' }}>Professional History</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                                    <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '15px' }}>Technical Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((s, i) => (
                                        <span key={i} style={{ fontSize: '11px', backgroundColor: '#E5E7EB', color: '#333', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '15px' }}>Education</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </div>
                        </div>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        ID: {generatedCvNumber} • Tech-Modern-Archive
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sync Technician Record?</h3>
            <p className="text-sm text-gray-600 mb-6">Proceeding will update the industrial database and generate your production-ready PDF document.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white font-semibold transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Syncing..." : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-8 border-[#2F4F4F]">
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Sync Complete</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Technician profile successfully archived.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-4 rounded-xl mb-6">
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[3px] mb-1">System Tracking ID</p>
               <p className="text-2xl font-black text-[#B7410E] font-mono">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}