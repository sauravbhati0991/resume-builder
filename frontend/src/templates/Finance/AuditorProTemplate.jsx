import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, ShieldCheck, ClipboardCheck, FileText, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium" 
    />
  </div>
);

export default function AuditorProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Auditor Pro",
    primaryColor: "#065f46", // Deep Emerald
    accentColor: "#fbbf24",  // Amber
    defaultData: {
      firstName: "Michael",
      lastName: "O'Keefe",
      title: "Senior Internal Auditor",
      email: "michael.audit@example.com",
      phone: "+1 555 789 0000",
      location: "Chicago, IL",
      summary: "Certified Internal Auditor (CIA) with 9 years of experience in risk assessment, SOX compliance, and operational audits. Dedicated to enhancing internal controls, streamlining business processes, and ensuring regulatory integrity.",
      skills: "Internal Controls, SOX Compliance, Risk Management, Data Analytics (ACL, IDEA), Fraud Investigation, ERP Systems",
      experience: [
        { role: "Senior Internal Auditor", company: "Midwest Financial Group", dates: "2018 - Present", description: "Lead comprehensive operational and financial audits. Identified process inefficiencies, recommending controls that saved $1.2M annually." },
        { role: "Staff Auditor", company: "Grant Thornton", dates: "2014 - 2018", description: "Executed compliance audits for manufacturing clients. Drafted detailed audit reports for executive management." }
      ],
      education: "B.S. in Accounting, DePaul University (2014)\nCertified Internal Auditor (CIA)"
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

  // Quick Sync Logic
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* COMPLIANCE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-100 h-9 px-4 uppercase border border-slate-200 rounded transition-all flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Templates
                </button>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm uppercase tracking-wider">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} Save_Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-bold h-9 px-6 rounded bg-slate-900 text-white hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Finalize_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full mt-4">
            
            {/* AUDIT INPUTS */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-slate-900 uppercase tracking-widest border-b pb-2"><FileText className="w-4 h-4" /> Personnel File</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Corporate Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Secure Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Direct Extension" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Hiring Region" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 p-3 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none mt-2"/>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Audit & Experience Log</h3>
                        <button onClick={addExperience} className="text-[10px] bg-emerald-600 text-white px-2 py-1 font-bold rounded uppercase">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Designation" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Entity/Firm" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Audit Period" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe scope, key findings, and process improvements..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm mt-1 outline-none focus:border-emerald-600"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Technical Proficiencies</h3>
                    <InputGroup label="Audit Methodology & Tools" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-6"></div>
                    <InputGroup label="Education & Certifications" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* AUDIT REPORT PREVIEW */}
            <div className="h-full bg-slate-300 flex justify-center p-8 overflow-auto custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '50px', backgroundColor: '#fcfcfc', borderTop: `10px solid ${templateConfig.primaryColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1', margin: '0 0 10px 0' }}>{data.firstName} {data.lastName}</h1>
                            <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClipboardCheck size={18} /> {data.title}
                            </div>
                        </div>
                        <div style={{ borderLeft: `3px solid ${templateConfig.accentColor}`, paddingLeft: '20px', fontSize: '11px', color: '#444', fontWeight: '600', lineHeight: '1.8' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ padding: '0 50px 50px', flex: 1 }}>
                        
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                I. Executive Summary
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333', margin: 0 }}>{data.summary}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0' }}>
                                II. Professional Engagement Log
                            </h3>
                            
                            <div style={{ borderTop: '2px solid #000', marginTop: '10px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ borderBottom: '1px solid #e2e8f0', padding: '25px 0', display: 'flex' }}>
                                        <div style={{ width: '30%', paddingRight: '20px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase' }}>{exp.company}</div>
                                            <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginTop: '5px' }}>{exp.dates}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: templateConfig.primaryColor, margin: '0 0 10px 0', textTransform: 'uppercase' }}>{exp.role}</h4>
                                            <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                    III. Scope of Expertise
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#111', border: '1px solid #ccc', padding: '4px 10px', backgroundColor: '#f8fafc' }}>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                    IV. Credentials
                                </h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#333', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      

      {/* SUCCESS MODAL */}
      

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