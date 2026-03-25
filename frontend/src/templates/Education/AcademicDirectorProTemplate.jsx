import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
    />
  </div>
);

export default function AcademicDirectorProTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();
  
  const templateConfig = {
    name: "Academic Director Pro",
    primaryColor: "#FF8C00", // Dark Orange
    accentColor: "#000080",  // Navy Blue
    defaultData: {
      firstName: "James",
      lastName: "Harrison",
      title: "Director of Academics",
      email: "j.harrison@academy.edu",
      phone: "+1 (555) 987-6543",
      location: "Chicago, IL",
      summary: "Visionary Academic Director with a decade of educational leadership. Dedicated to advancing curriculum standards, recruiting top-tier faculty, and integrating technology to enhance student learning outcomes across the district.",
      skills: "Educational Leadership, Budget Management, Faculty Recruitment & Evaluation, EdTech Strategy, State Compliance, Policy Development",
      experience: [
        { role: "Director of Academics", company: "Chicago Excellence Charter", dates: "2018 - Present", description: "Oversee academic programs for 3 campuses (2,000+ students). Managed a $5M annual academic budget. Implemented a 1:1 iPad initiative." },
        { role: "Principal", company: "Northside Middle School", dates: "2012 - 2018", description: "Led a staff of 45 teachers. Elevated school state ranking from 'C' to 'A' over a 4-year period through targeted intervention programs." }
      ],
      education: "Ed.D. in Educational Leadership, Northwestern Univ. (2016)\nM.A. in Education, Loyola University (2010)"
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

      // 1. Persist to Database
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Education",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. Generate PDF Locally
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollX: 0, scrollY: -window.scrollY },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output('blob');

      // 3. Upload PDF File
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Trigger Save & Show UI
      await worker.save();
      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Critical error in Academic Director flow:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResumeLocal} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}><Download className="w-4 h-4 mr-2" /> PDF Export</button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Academic Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Institution</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Institution" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Competencies & Education</h3>
                    <InputGroup label="Skills (Comma separated)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education Credentials" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* Bold Orange Header */}
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 50px' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '18px', fontWeight: '500', opacity: 0.9, letterSpacing: '1px', margin: 0 }}>{data.title}</h2>
                        
                        <div style={{ marginTop: '20px', display: 'flex', gap: '25px', fontSize: '12px', opacity: 0.9 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '40px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '10px' }}>Executive Profile</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px' }}>Leadership Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#222', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px' }}>Core Competencies</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '6px', height: '6px', backgroundColor: templateConfig.primaryColor, flexShrink: 0 }}></span>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                                <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </div>
                        </div>
                    </div>

                    {generatedCvNumber && (
                        <div style={{ position: 'absolute', bottom: '15px', right: '25px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {generatedCvNumber} • Verification: resumea.com/cv/{generatedCvNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Institutional PDF?</h3>
            <p className="text-sm text-gray-600 mb-6">This will save your executive profile and create a unique verification link for academic board review.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}>
                {isDownloading ? "Saving..." : "Generate Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">CV Exported Successfully</h3>
            <p className="text-sm text-gray-600 mb-4">Your CV has been assigned a permanent academic verification ID:</p>
            <div className="bg-gray-100 py-2 px-4 rounded-lg font-mono text-sm font-bold text-gray-700 mb-6 border border-gray-200">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-2.5 rounded-lg text-white font-bold" style={{ backgroundColor: templateConfig.accentColor }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}