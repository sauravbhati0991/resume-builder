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

export default function OperationsSpecialistProTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Operations Specialist Pro",
    primaryColor: "#B7410E", 
    accentColor: "#2F4F4F",  
    defaultData: {
      firstName: "Karen",
      lastName: "O'Neil",
      title: "Manufacturing Operations Specialist",
      email: "karen.oneil@operations.com",
      phone: "+1 555 234 5678",
      location: "Chicago, IL",
      summary: "Results-driven Operations Specialist with 8 years of experience streamlining supply chain workflows and manufacturing processes. Adept at Lean Manufacturing principles, inventory control, and fostering cross-departmental communication to hit aggressive production targets.",
      skills: "Lean Manufacturing, 5S Principles, Supply Chain Logistics, Inventory Management, ERP Systems (SAP), Process Optimization, Team Coordination",
      experience: [
        { role: "Operations Specialist", company: "Prime Manufacturing", dates: "2018 - Present", description: "Coordinate daily production schedules to meet order fulfillment targets. Implemented a 5S lean initiative that reduced workstation clutter and improved throughput by 10%." },
        { role: "Inventory Coordinator", company: "Logistics Hub Inc.", dates: "2014 - 2018", description: "Managed a $2M raw material inventory. Reconciled discrepancies in the ERP system and maintained a 99% accuracy rate during quarterly audits." }
      ],
      education: "B.S. Supply Chain Management, Loyola University (2014)"
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
        categoryName: "Operations",
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
      console.error("Critical: Operations Sync failed", err);
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
                    
                    <div style={{ textAlign: 'center', padding: '40px 50px 20px' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            {data.firstName} <span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                        </h1>
                        <p style={{ fontSize: '15px', color: '#555', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>{data.title}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '8px 0' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '20px 50px 40px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', textAlign: 'center', fontStyle: 'italic' }}>{data.summary}</p>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', backgroundColor: templateConfig.accentColor, padding: '5px 15px', display: 'inline-block', textTransform: 'uppercase', marginBottom: '15px' }}>Key Competencies</h3>
                                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s.trim()}</li>)}
                                </ul>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', backgroundColor: templateConfig.accentColor, padding: '5px 15px', display: 'inline-block', textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </section>
                        </div>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', backgroundColor: templateConfig.primaryColor, padding: '5px 15px', display: 'inline-block', textTransform: 'uppercase', marginBottom: '20px' }}>Career Progression</h3>
                            <div style={{ borderLeft: `2px solid ${templateConfig.primaryColor}`, paddingLeft: '20px', marginLeft: '10px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '25px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-26px', top: '2px', width: '10px', height: '10px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', margin: '0 0 2px 0' }}>{exp.role}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.company}</span>
                                            <span style={{ fontSize: '12px', color: '#777', fontWeight: '600' }}>{exp.dates}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#444', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        ID: {generatedCvNumber} • Ops-Standard-Archive
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sync with Ops Database?</h3>
            <p className="text-sm text-gray-600 mb-6">Proceeding will archive this specialist profile and generate a high-fidelity PDF document.</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Profile Synced</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Document successfully archived and downloaded.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-4 rounded-xl mb-6">
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[3px] mb-1">Generated CV ID</p>
               <p className="text-2xl font-black text-[#B7410E] font-mono">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}