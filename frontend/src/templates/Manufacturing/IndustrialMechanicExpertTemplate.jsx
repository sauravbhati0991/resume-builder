import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, Save, Database, ShieldCheck, CheckCircle2, Wrench } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7410E] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function IndustrialMechanicExpertTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Industrial Mechanic Expert",
    primaryColor: "#B7410E", // Burnt Orange
    accentColor: "#2F4F4F",  // Dark Slate Gray
    defaultData: {
      firstName: "David",
      lastName: "Miller",
      title: "Master Industrial Mechanic",
      email: "d.miller@mechanic.com",
      phone: "+1 555 444 3322",
      location: "Houston, TX",
      summary: "Highly skilled Industrial Mechanic specializing in the preventive maintenance, troubleshooting, and repair of heavy manufacturing equipment. Expert in hydraulics, pneumatics, and motor control systems.",
      skills: "Hydraulics & Pneumatics, PLC Troubleshooting, Preventive Maintenance, Arc Welding, Blueprint Schematic Reading, Heavy Machinery Repair",
      experience: [
        { role: "Senior Maintenance Mechanic", company: "Apex Manufacturing", dates: "2016 - Present", description: "Perform daily preventative maintenance on conveyor systems and hydraulic presses. Reduced machine downtime by 25% through proactive parts replacement." },
        { role: "Industrial Mechanic", company: "Global Fabrication", dates: "2010 - 2016", description: "Diagnosed and repaired mechanical, electrical, and pneumatic defects. Trained junior mechanics on proper lockout/tagout procedures." }
      ],
      education: "A.A.S. Industrial Maintenance Technology, Texas State Technical College (2010)"
    }
  };

  // MASTER PATTERN STATE
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
        const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleArrayChange = (index, arrayName, e) => {
    const { name, value } = e.target;
    const newArray = [...data[arrayName]];
    newArray[index][name] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // MASTER FLOW: Handshake -> Render -> Archive -> Download
        const handleSave = async () => {
    setIsSaving(true);
    try {
      const cvNumber = await saveResume(data);
      if (cvNumber) {
        setSavedCvNumber(cvNumber);
        // Background PDF Upload to Cloudinary
        try {
          const element = previewRef.current;
          const pdfBlob = await html2pdf()
            .set({
              margin: 0,
              filename: `${data.firstName}_Resume.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(element)
            .outputPdf('blob');

          const formData = new FormData();
          formData.append("file", pdfBlob, `${cvNumber}.pdf`);
          formData.append("cvNumber", cvNumber);

          await api.post("/resume-upload/resume-pdf", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        } catch (uploadError) {
          console.error("Background PDF upload failed:", uploadError);
        }
        setShowSaveSuccessModal(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${data.firstName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };

return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* INDUSTRIAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-[#2F4F4F] shadow-xl rounded-lg p-4 flex justify-between items-center border-b-4 border-[#B7410E]">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 h-9 px-4 uppercase rounded flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_BUILDER
                </button>
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#B7410E]" />
                  <span className="font-bold text-sm text-white uppercase tracking-widest">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="text-[10px] font-bold h-9 px-4 rounded bg-white/10 text-white hover:bg-white/20 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} SYNC_DRAFT
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-[10px] font-black h-9 px-6 rounded bg-[#B7410E] text-white hover:bg-[#a33a0d] transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} EXPORT_CERTIFIED_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0 mt-4">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-900 border-b pb-2">Personnel Identity</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Professional Rank" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Secure Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Primary Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 border p-4 rounded text-sm focus:ring-1 focus:ring-[#B7410E]"/>
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Maintenance & Repair History</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold text-[#B7410E] uppercase">+ New Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-5 border border-slate-100 rounded bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Rank/Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Tenure" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={4} placeholder="Key repairs, system maintenance, and downtime reduction metrics..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-3 text-sm focus:border-[#B7410E] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow p-8 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Technical Capabilities</h3>
                    <InputGroup label="Core Skills (Hydraulics, PLC, Welding...)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-6"></div>
                    <InputGroup label="Apprenticeship & Education" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 overflow-auto flex justify-center p-10 custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
                    
                    {/* Industrial Sidebar */}
                    <div style={{ width: '35%', backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: `4px solid ${templateConfig.primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>
                                {data.firstName}<br/><span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                            </h1>
                            <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', opacity: 0.8 }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Contact Info</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.9 }}>
                                <div>{data.phone}</div>
                                <div>{data.email}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Technical Core</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.9 }}>{skill.trim()}</div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '15px', letterSpacing: '1px' }}>Qualifications</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.5', opacity: 0.9 }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ width: '65%', padding: '40px 45px' }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '3px', backgroundColor: templateConfig.primaryColor }}></div> Personnel Profile
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '3px', backgroundColor: templateConfig.primaryColor }}></div> Technical Experience
                            </h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: '700' }}>{exp.company}</span>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    
                </div>
            </div>
        </div>
      </div>

      {/* MASTER MODALS */}
      

      

      {/* Save Success Modal */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Saved Successfully!</h3>
            <p className="text-sm text-gray-500 mb-2">Your resume has been saved to the database.</p>
            <p className="text-lg font-mono font-bold text-gray-900 mb-6 bg-gray-50 py-3 rounded-lg border border-gray-100">{savedCvNumber}</p>
            <button onClick={() => setShowSaveSuccessModal(false)} className="w-full py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-opacity hover:opacity-90" style={{ backgroundColor: '#2563EB' }}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}