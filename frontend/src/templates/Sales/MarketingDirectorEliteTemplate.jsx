import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Award, CheckCircle, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 transition-shadow" 
    />
  </div>
);

export default function MarketingDirectorEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Marketing Director Elite",
    primaryColor: "#CC3300", // Sophisticated Deep Red
    accentColor: "#FFD700",  // Gold
    defaultData: {
      firstName: "Victoria",
      lastName: "Sterling",
      title: "Director of Marketing",
      email: "v.sterling@example.com",
      phone: "+1 (555) 876-5432",
      location: "New York, NY",
      summary: "Data-driven Marketing Director with 12+ years of experience leading high-performance teams and executing multi-channel global campaigns. Proven track record of increasing brand awareness, driving customer acquisition, and achieving a 300% ROI on digital spend.",
      skills: "Brand Strategy, Team Leadership, Budget Management ($5M+), Digital Marketing, SEO/SEM, Data Analytics, Go-to-Market Strategy",
      experience: [
        { role: "Director of Global Marketing", company: "Nexus Enterprise", dates: "2018 - Present", description: "Directed a team of 25 marketing professionals across 3 continents. Launched a rebranding initiative that increased market share by 18% in Q1 2023." },
        { role: "Senior Marketing Manager", company: "Elevate Media", dates: "2013 - 2018", description: "Managed a $2M annual advertising budget. Optimized PPC campaigns, reducing CPA by 25% while increasing conversion rates." }
      ],
      education: "MBA in Marketing, Stern School of Business (2012)\nB.A. in Communications, NYU (2008)"
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

  // Standard Local Sync
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* EXECUTIVE TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-50 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> All Templates</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Directorate Edition</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2 text-orange-600" />} Save Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-lg hover:brightness-110 disabled:opacity-70 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Finalize PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* EDITOR PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-slate-700 underline decoration-orange-500 decoration-2 underline-offset-4">Executive Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Directorship Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Work Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="HQ Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-bold mb-4 uppercase tracking-tight text-slate-700">Value Proposition (Summary)</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-orange-600 outline-none leading-relaxed"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-md font-bold uppercase tracking-tight text-slate-700">Strategic Career Timeline</h3><button onClick={addExperience} className="text-sm text-orange-700 font-bold hover:underline">+ Add Mandate</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Executive Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Duration" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-orange-600 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-md font-bold mb-4 uppercase tracking-tight text-slate-700">Competencies & Pedigree</h3>
                    <InputGroup label="Core Competencies (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic Credentials" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '45px 50px', borderBottom: `8px solid ${templateConfig.accentColor}` }}>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
                            {data.firstName} {data.lastName}
                        </h1>
                        <h2 style={{ fontSize: '18px', fontWeight: '400', opacity: 0.9, letterSpacing: '2px', marginBottom: '25px', margin: 0 }}>
                            {data.title}
                        </h2>
                        <div style={{ display: 'flex', gap: '30px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.85 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} color={templateConfig.accentColor}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={13} color={templateConfig.accentColor}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={13} color={templateConfig.accentColor}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '45px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px', letterSpacing: '1px' }}>Executive Mandate</h3>
                            <p style={{ fontSize: '14px', lineHeight: '1.75', color: '#1e293b', margin: 0, textAlign: 'justify' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', letterSpacing: '1px' }}>Strategic Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', fontWeight: '900', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 12px', borderRadius: '2px', border: `1px solid #e2e8f0` }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div style={{ flex: 1.2 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Core Capabilities</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', backgroundColor: '#f8fafc', padding: '6px 12px', border: '1px solid #f1f5f9', borderLeft: `3px solid ${templateConfig.accentColor}` }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ flex: 0.8 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Education</h3>
                                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                            </div>
                        </div>
                    </div>

                    {/* Elite Verification Footer */}
                    
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