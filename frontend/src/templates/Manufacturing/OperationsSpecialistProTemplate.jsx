import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value} 
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7410E]" />
  </div>
);

export default function OperationsSpecialistProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
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
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
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
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-[#B7410E]"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold">+ Add</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Company" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#B7410E]"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
                    <InputGroup label="Skills" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" name="education" value={data.education} onChange={handleInputChange}/>
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

                    
                </div>
            </div>
        </div>
      </div>

      

      

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