import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api"; // Added: Unified API utility
import { ArrowLeft, Save, Download, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7410E]" />
  </div>
);

export default function SafetyComplianceLeadTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Safety Compliance Lead",
    primaryColor: "#B7410E", // Rust
    accentColor: "#2F4F4F",  // Dark Gray
    defaultData: {
      firstName: "Marcus",
      lastName: "Brody",
      title: "Safety Compliance Lead",
      email: "m.brody@safety.com",
      phone: "+1 555 888 1234",
      location: "Cleveland, OH",
      summary: "OSHA-certified Safety Compliance Lead with 12 years of experience in heavy manufacturing. Proven track record of reducing workplace incidents by 40% through rigorous audits, employee training, and the implementation of robust safety protocols.",
      skills: "OSHA Regulations, Hazard Identification, Risk Assessment, Incident Investigation, LOTO, Safety Training, First Aid/CPR",
      experience: [
        { role: "EHS Manager", company: "SteelForge Industries", dates: "2017 - Present", description: "Conducted weekly safety audits across a 200,000 sq ft facility. Developed and led mandatory safety training for 300+ floor workers. Spearheaded the 'Zero Harm' initiative." },
        { role: "Safety Coordinator", company: "Industrial Build Co.", dates: "2012 - 2017", description: "Managed personal protective equipment (PPE) inventory. Investigated workplace near-misses and drafted corrective action reports." }
      ],
      education: "B.S. Occupational Safety and Health, Ohio State (2012)\nCertified Safety Professional (CSP)"
    }
  };

  // Added: Logic states for sync process
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

  // Changed: Standard local save with feedback
  const saveResume = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`resume_${templateConfig.name}`, JSON.stringify(data));
      setIsSaving(false);
    }, 1000);
  };

  // Added: Professional sync logic (Save to DB -> Generate PDF -> Upload PDF)
  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // STEP 1: Sync JSON to Database
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Safety & Compliance",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // STEP 2: Configure high-quality PDF
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
            scrollY: -window.scrollY // Added: Fixes blank space bug
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      // STEP 3: Generate blob for server storage
      const pdfBlob = await worker.output("blob");

      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      // STEP 4: Upload file to storage
      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await worker.save(); // Local download

      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Critical: Resume archiving failed", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  // Changed: PDF button now opens confirmation modal
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
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90" style={{ backgroundColor: templateConfig.primaryColor }}>
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
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-[#B7410E] outline-none"/>
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
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#B7410E] outline-none"/>
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

            {/* PREVIEW - DESIGN UNCHANGED */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 50px', borderBottom: `6px solid ${templateConfig.primaryColor}` }}>
                        <h1 style={{ fontSize: '38px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '18px', color: '#D1D5DB', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                        
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color={templateConfig.primaryColor}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color={templateConfig.primaryColor}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color={templateConfig.primaryColor}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '40px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Overview</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '20px' }}>Professional Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#555', fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Safety & Skills</h3>
                                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s.trim()}</li>)}
                                </ul>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Credentials</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>

                    {/* Footer for Reference Number */}
                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace' }}>
                        ID: {generatedCvNumber} • Safety-Standard-Archived
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Added: Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update & Generate?</h3>
            <p className="text-sm text-gray-600 mb-6">This will sync your current data with the server and create a professional PDF copy.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white disabled:opacity-70 transition-all font-semibold" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Syncing..." : "Yes, Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Added: Success Modal UI */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-4 border-[#B7410E]">
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Resume Synced</h3>
            <p className="text-sm text-gray-600 mb-2">Successfully uploaded to Safety-Compliance database.</p>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg mb-6">
               <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">CV Tracking Number</p>
               <p className="text-lg font-bold text-[#B7410E]">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="px-6 py-2 rounded-lg text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: templateConfig.primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}