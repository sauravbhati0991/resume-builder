import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Microscope, Beaker, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]" />
  </div>
);

export default function LabManagerModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Lab Manager Modern",
    primaryColor: "#008080", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Valerie",
      lastName: "Frizzle",
      title: "Laboratory Operations Manager",
      email: "v.frizzle@researchlab.org",
      phone: "+1 555 404 0000",
      location: "Boston, MA",
      summary: "Detail-oriented Lab Manager with 8 years of experience overseeing BSL-2 and BSL-3 facilities. Proven expertise in equipment maintenance, reagent procurement, and ensuring strict compliance with OSHA and EPA regulations. Dedicated to maximizing operational efficiency so scientists can focus on discovery.",
      skills: "Lab Safety & Compliance, BSL-2/BSL-3 Operations, Inventory Management, Equipment Calibration, LIMS Software, Budgeting, SOP Development",
      experience: [
        { role: "Senior Lab Manager", company: "GenoTech Research Institute", dates: "2018 - Present", description: "Manage a $2M annual operating budget. Oversee inventory and procurement for 45 research scientists. Successfully passed 3 consecutive state safety audits with zero infractions." },
        { role: "Lab Technician / Safety Officer", company: "BioHealth Labs", dates: "2013 - 2018", description: "Calibrated and maintained centrifuges, mass spectrometers, and PCR machines. Wrote and updated standard operating procedures (SOPs) for hazardous waste disposal." }
      ],
      education: "B.S. Biochemistry, Boston University (2013)\nCertified Chemical Hygiene Officer (CCHO)"
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
        categoryName: "Science",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `Lab_Manager_${data.lastName}.pdf`,
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
      console.error("Critical: Archive Sync failed", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-bold text-[#008080] tracking-tight">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</> : <><Download className="w-4 h-4 mr-2" /> Generate PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Beaker size={20} className="text-[#008080]"/> Lab Personnel Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Managerial Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Executive Abstract</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-[#008080] bg-gray-50/50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-bold">
                        <h3>Operational History</h3>
                        <button onClick={addExperience} className="text-xs bg-[#008080] text-white px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity">+ Add Position</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50/30 relative group border-dashed border-gray-300">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#008080]"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[#008080]"/> Compliance & Education</h3>
                    <InputGroup label="Lab Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Certifications & Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
                    <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: templateConfig.accentColor, padding: '40px 30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: `2px solid rgba(255,255,255,0.2)`, paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>{data.firstName}<br/>{data.lastName}</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{data.title}</p>
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Contact</h3>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>{data.phone}</div>
                                <div>{data.email}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Lab Skills</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '12px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{skill.trim()}</div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{data.education}</p>
                        </div>
                    </div>
                    <div style={{ width: '65%', padding: '40px 45px' }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.primaryColor }}></div> Profile
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.primaryColor }}></div> Professional History
                            </h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>{exp.company}</span>
                                        <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        SEQ ID: {generatedCvNumber} • LAB-RECOGNIZED-PROTOCOL
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Sync Lab Asset?</h3>
            <p className="text-sm text-gray-600 mb-6 italic">Proceeding will archive this laboratory operational profile in our secure central repository and generate your verified PDF.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs font-black uppercase">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-5 py-2 rounded-lg text-white font-black transition-all shadow-md text-xs uppercase" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Archiving..." : "Confirm Sync"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 text-slate-900">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-8 border-[#008080]">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Record Validated</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Laboratory Operations profile has been successfully synced with the scientific directory.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-xl mb-6 flex flex-col items-center">
               <Microscope className="text-[#008080] mb-2" size={32}/>
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1">Archive Reference</p>
               <p className="text-3xl font-black text-[#008080] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3.5 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}