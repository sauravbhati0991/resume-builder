import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
    />
  </div>
);

export default function BrandStrategyModernTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();
  
  const templateConfig = {
    name: "Brand Strategy Modern",
    primaryColor: "#FF4500", // Vibrant Red-Orange
    accentColor: "#FFD700",  // Gold/Yellow
    defaultData: {
      firstName: "Chloe",
      lastName: "Zane",
      title: "Brand Strategist",
      email: "chloe.zane@example.com",
      phone: "+1 (555) 345-6789",
      location: "Los Angeles, CA",
      summary: "Creative Brand Strategist with a passion for storytelling and cultural trends. Expert in defining brand identity, conducting market research, and executing omni-channel campaigns that resonate with modern consumers and drive brand loyalty.",
      skills: "Brand Identity & Positioning, Consumer Insights, Copywriting, Omnichannel Marketing, Trend Forecasting, Adobe Creative Suite",
      experience: [
        { role: "Senior Brand Strategist", company: "Visionary Agency", dates: "2020 - Present", description: "Led a total brand refresh for a major DTC retail client, resulting in a 45% increase in Gen Z engagement. Developed comprehensive brand guidelines used across 5 global offices." },
        { role: "Marketing Coordinator", company: "Fresh Press", dates: "2016 - 2020", description: "Coordinated influencer partnerships and managed social media content calendars across Instagram and TikTok." }
      ],
      education: "B.A. in Public Relations, USC (2016)"
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

      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Sales and Marketing",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `STRATEGY_${data.lastName}_${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollX: 0, scrollY: -window.scrollY },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output('blob');

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
      console.error("Workflow failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700 tracking-tight">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResumeLocal} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                  <Download className="w-4 h-4 mr-2" /> Export Strategy PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Identity</h3>
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
                    <h3 className="text-lg font-bold mb-4">The Narrative (Summary)</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience Portfolio</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Brand</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Company / Agency" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Competencies & Learning</h3>
                    <InputGroup label="Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* Centered Modern Header */}
                    <div style={{ padding: '50px 50px 30px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '46px', fontWeight: 'bold', color: '#111', textTransform: 'lowercase', letterSpacing: '-1px', marginBottom: '5px', margin: 0 }}>
                            {data.firstName}.<span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                        </h1>
                        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                          <h2 style={{ display: 'inline-block', backgroundColor: templateConfig.accentColor, color: '#111', padding: '5px 15px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                              {data.title}
                          </h2>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px', color: '#555', fontWeight: '500' }}>
                            <span>{data.email}</span>
                            <span>{data.phone}</span>
                            <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '0 50px 50px', flex: 1 }}>
                        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#444', maxWidth: '90%', margin: '0 auto' }}>
                                {data.summary}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                            {/* Left Column */}
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Skill Set</h3>
                                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <li key={i} style={{ fontSize: '12px', color: '#444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '6px', height: '6px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></span>
                                            {skill.trim()}
                                        </li>
                                    ))}
                                </ul>

                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px', marginTop: '40px' }}>Education</h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                            </div>

                            {/* Right Column */}
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '20px' }}>Work Experience</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '30px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '12px', color: '#888', fontWeight: 'bold' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#111', fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {generatedCvNumber && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '30px', fontSize: '9px', color: '#cbd5e1', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Design ID: {generatedCvNumber} • verify at resumea.com/auth
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Finalize Your Brand?</h3>
            <p className="text-sm text-gray-600 mb-6">This will generate a high-fidelity PDF and secure a unique tracking code for your professional portfolio.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Keep Editing</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white font-bold shadow-md transition-opacity" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Processing..." : "Export Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Document Published</h3>
            <p className="text-sm text-gray-600 mb-4">Your strategy profile is now verifiable via its unique identifier:</p>
            <div className="bg-gray-50 py-3 px-4 rounded-xl font-mono text-sm font-bold text-gray-800 mb-6 border border-dashed border-gray-300 tracking-wider uppercase">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg text-white font-bold shadow-lg transition-transform active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>Return to Editor</button>
          </div>
        </div>
      )}
    </div>
  );
}