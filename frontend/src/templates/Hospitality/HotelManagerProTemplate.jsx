import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A460]" />
  </div>
);

export default function HotelManagerProTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Hotel Manager Pro",
    primaryColor: "#F4A460", 
    accentColor: "#4682B4",  
    defaultData: {
      firstName: "Julian",
      lastName: "Reyes",
      title: "General Hotel Manager",
      email: "julian.reyes@hotel.com",
      phone: "+1 555 321 0000",
      location: "Miami, FL",
      summary: "Visionary Hotel Manager with 12 years of experience directing luxury properties. Proven ability to increase occupancy rates by 20%, elevate guest satisfaction scores, and cultivate high-performing hospitality teams.",
      skills: "Revenue Management, Guest Experience, Staff Training, P&L Accountability, Event Coordination, Micros/Opera PMS",
      experience: [
        { role: "General Manager", company: "Oceanview Resort & Spa", dates: "2018 - Present", description: "Direct daily operations of a 300-room luxury property. Increased annual revenue by $2.5M through strategic upselling and corporate event bookings." },
        { role: "Front Office Manager", company: "The Grand Plaza", dates: "2012 - 2018", description: "Managed a team of 25 front desk agents, concierges, and bell staff. Resolved VIP guest escalations and maintained a 4.8/5 TripAdvisor rating." }
      ],
      education: "B.S. Hospitality Management, Florida International University (2012)"
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
        categoryName: "Hospitality",
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
      console.error("Critical: Hospitality Sync failed", err);
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
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.accentColor }}>
                   {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
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
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-[#F4A460]"/>
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
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#F4A460]"/>
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
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative', fontFamily: '"Georgia", serif' }}>
                    
                    {/* Left Sidebar (Sea Blue) */}
                    <div style={{ width: '35%', backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 30px' }}>
                        <div style={{ borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>{data.firstName}<br />{data.lastName}</h1>
                            <p style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Contact</h3>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.4' }}>
                                <div>{data.phone}</div>
                                <div>{data.email}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Core Skills</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{skill.trim()}</div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ width: '65%', padding: '40px 45px' }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Profile</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '20px' }}>Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: templateConfig.accentColor, fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                        ID: {generatedCvNumber} • Hospitality-Pro-Archive
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sync Hotel Manager Profile?</h3>
            <p className="text-sm text-gray-600 mb-6">Proceeding will archive this management record in the global database and generate your production-ready PDF.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white font-semibold transition-all" style={{ backgroundColor: templateConfig.accentColor }}>
                {isDownloading ? "Syncing..." : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-8 border-[#4682B4]">
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Sync Complete</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Manager profile successfully archived in the hospitality system.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-4 rounded-xl mb-6">
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[3px] mb-1">Property Verification ID</p>
               <p className="text-2xl font-black text-[#F4A460] font-mono">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.accentColor }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}