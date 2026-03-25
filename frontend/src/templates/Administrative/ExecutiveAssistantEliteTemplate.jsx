import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Briefcase, Award, GraduationCap, Settings, Database } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function ExecutiveAssistantEliteTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Executive Assistant Elite",
    primaryColor: "#f1f5f9", // Slate 100
    accentColor: "#475569",  // Slate 600
    defaultData: {
      firstName: "Eleanor",
      lastName: "Vance",
      title: "C-Suite Executive Assistant",
      email: "eleanor.vance@example.com",
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      summary: "Highly discreet and exceptionally organized Executive Assistant with over 12 years of experience supporting CEOs and Board Members of Fortune 500 companies. Expert in complex global travel, calendar management, and cross-departmental liaison.",
      skills: "Board Relations, Calendar Management, Global Travel, Expense Reporting, Confidentiality, Event Planning, Concur, Salesforce, Project Management",
      experience: [
        { role: "Executive Assistant to CEO", company: "Global Finance Corp", dates: "2019 - Present", description: "Manage the CEO's highly complex calendar, resolving conflicting priorities and ensuring 100% schedule adherence. Coordinate quarterly Board of Directors meetings, including travel, accommodations, and comprehensive reporting packets for 12 board members." },
        { role: "Senior Administrative Assistant", company: "Manhattan Investments", dates: "2014 - 2019", description: "Provided comprehensive support to 3 Managing Directors. Processed multi-currency expense reports exceeding $50k monthly and organized international client roadshows across 4 continents." }
      ],
      education: "B.A. in Communications, New York University (2012)\nProfessional Administrative Certification (PACE)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
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
        categoryName: "Administrative and Support",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: -window.scrollY
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
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
      console.error("Resume Save Failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  const downloadPDF = async () => {
    setShowReplaceModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* ELITE TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-b-2 border-slate-300 shadow-sm p-4 flex justify-between items-center rounded-lg">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center uppercase tracking-widest transition-all">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Files
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-slate-400">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={saveResume} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0 mt-4">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-8 rounded border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-widest border-b pb-2"><Settings className="w-4 h-4" /> Personal Configuration</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="Given Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Surname" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Designated Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Primary Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Secure Phone" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="HQ Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-widest text-slate-800 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-4 rounded text-sm font-medium focus:outline-slate-300 transition-all mt-2 border border-slate-100 shadow-inner"/>
                </div>

                <div className="bg-white p-8 rounded border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Professional History</h3>
                        <button onClick={addExperience} className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-900">+ Add Tenancy</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded bg-slate-50 relative group border border-slate-100">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Position" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Dates of Support" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={4} placeholder="Detail support operations, travel coordination, and executive outcomes..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-3 text-sm mt-1 outline-none focus:border-slate-400 bg-white shadow-inner"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 rounded border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-widest text-slate-800 border-b pb-2">Competencies & Education</h3>
                    <InputGroup label="Key Skills (Separated by commas)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic Background" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-300 flex justify-center p-12 overflow-auto custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}>
                    
                    {/* Elite Institutional Header */}
                    <div style={{ backgroundColor: templateConfig.primaryColor, padding: '50px 70px', borderTop: `10px solid ${generatedCvNumber ? '#1e293b' : templateConfig.accentColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#1e293b', margin: '0 0 5px 0', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                                    {data.firstName} <span style={{ color: '#64748b', fontWeight: '300' }}>{data.lastName}</span>
                                </h1>
                                <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
                                    {data.title}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#475569', lineHeight: '2', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.email} <Mail size={12} color="#94a3b8"/></div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.phone} <Phone size={12} color="#94a3b8"/></div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.location} <MapPin size={12} color="#94a3b8"/></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '50px 70px', flex: 1 }}>
                        
                        {/* Executive Profile Section */}
                        <div style={{ marginBottom: '45px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <Award size={18} color="#94a3b8" />
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Executive Profile</h3>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0', marginLeft: '10px' }}></div>
                            </div>
                            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.8', fontWeight: '500', textAlign: 'justify' }}>{data.summary}</p>
                        </div>

                        {/* Experience Section */}
                        <div style={{ marginBottom: '45px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <Briefcase size={18} color="#94a3b8" />
                                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Professional History</h3>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0', marginLeft: '10px' }}></div>
                            </div>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Grid Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
                            {/* Competencies */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Settings size={18} color="#94a3b8" />
                                    <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Competencies</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                            <div style={{ width: '4px', height: '4px', backgroundColor: '#94a3b8', transform: 'rotate(45deg)' }}></div>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Credentials */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <GraduationCap size={18} color="#94a3b8" />
                                    <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Credentials</h3>
                                </div>
                                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line', fontWeight: '700' }}>{data.education}</p>
                            </div>
                        </div>

                    </div>

                    {/* Footer / Tracking */}
                    <div style={{ marginTop: 'auto', padding: '30px 70px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#cbd5e1', letterSpacing: '2px', textTransform: 'uppercase' }}>Elite Service Protocol // v.2026</span>
                        {generatedCvNumber && (
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#1e293b', letterSpacing: '3px' }}>REF_{generatedCvNumber}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Update Resume?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This resume will be replaced with the latest changes.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={runDownloadProcess}
                disabled={isDownloading}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-70"
                style={{ backgroundColor: templateConfig.accentColor }}
              >
                {isDownloading ? "Generating..." : "Yes, Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">
              Resume Saved Successfully
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Your latest resume has been uploaded and downloaded.
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-6">
              CV Number: {generatedCvNumber}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-5 py-2 rounded-lg text-white"
              style={{ backgroundColor: templateConfig.accentColor }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}