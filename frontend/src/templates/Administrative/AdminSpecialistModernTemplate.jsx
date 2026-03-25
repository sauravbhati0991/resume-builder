import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Loader2, 
  Monitor, 
  Database, 
  Cpu, 
  Globe 
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-[0.2em]">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-lg border-2 border-slate-100 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors font-medium text-slate-700" 
    />
  </div>
);

export default function AdminSpecialistModernTemplate() {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Admin Specialist Modern",
    primaryColor: "#f8fafc", // Slate 50
    accentColor: "#0ea5e9",  // Sky 500
    defaultData: {
      firstName: "Jamie",
      lastName: "O'Connor",
      title: "Administrative Operations Specialist",
      email: "jamie.ops@digitaloffice.com",
      phone: "+1 444 555 6666",
      location: "Boston, MA",
      summary: "Modern Administrative Specialist combining traditional office management with digital transformation skills. Expert at migrating legacy systems to cloud-based platforms, automating workflows with Zapier, and optimizing team communications across hybrid environments.",
      skills: "Digital Transformation, Workflow Automation, Google Workspace Admin, Data Analytics, Slack/Teams Mastery, Project Management (Asana), CRM Maintenance",
      experience: [
        { role: "Administrative Operations Lead", company: "NextGen Software", dates: "2021 - Present", description: "Spearheaded the transition from paper to digital record keeping, reducing retrieval time by 80%. Automated department expense reporting using Zapier and Slack integrations. Manage digital infrastructure for a department of 40." },
        { role: "Office Systems Assistant", company: "Boston Legal Group", dates: "2018 - 2021", description: "Handled sensitive client documents and implemented a cloud-based deposition scheduling system. Assisted the office manager with digital billing migrations." }
      ],
      education: "A.A. in Business Systems, Boston Community College (2018)\nGoogle Professional Workspace Administrator Certificate"
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* MODERN TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-md border-b-2 border-sky-100 shadow-sm rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="text-xs font-black px-4 h-9 rounded-xl hover:bg-slate-100 flex items-center uppercase tracking-widest text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2 px-2">
                  <Cpu className="w-5 h-5 text-sky-500" />
                  <span className="font-black text-sm uppercase tracking-tighter italic">{templateConfig.name}</span>
                </div>
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

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0 mt-2">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                    <h3 className="text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-sky-600 flex items-center gap-2"><Monitor size={16}/> Hardware & Identity</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Modern Job Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Email / Slack" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Base Location" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-sky-600 border-b-2 border-sky-50 pb-2">Operational Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-sky-200 border-none transition-all outline-none"/>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                     <div className="flex justify-between items-center mb-6 border-b-2 border-sky-50 pb-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-600">Deployment History</h3>
                        <button onClick={addExperience} className="text-[10px] font-black text-sky-500 uppercase tracking-widest">+ Add Record</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 border-2 border-slate-50 rounded-2xl bg-white relative group hover:border-sky-100 transition-all">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Timeline" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={4} placeholder="Describe tech implementations, workflow savings, and daily operations..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border-2 border-slate-100 rounded-xl p-4 text-sm focus:border-sky-300 outline-none transition-all"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-sky-600 border-b-2 border-sky-50 pb-2 flex items-center gap-2"><Globe size={16}/> Tech Stack & Training</h3>
                    <InputGroup label="Modern Tools (Google Admin, CRM, etc.)" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-300 flex justify-center p-12 overflow-auto custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* Minimalist Tech Header */}
                    <div style={{ padding: '60px 60px 40px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '48px', fontWeight: '200', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '8px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '800', color: templateConfig.accentColor }}>{data.firstName}</span> {data.lastName}
                        </h1>
                        <p style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '700', marginBottom: '25px' }}>
                            {data.title}
                        </p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px 30px', borderRadius: '4px', fontSize: '10px', color: '#475569', fontWeight: '800', letterSpacing: '1px', border: '1px solid #e2e8f0' }}>
                            {data.email} &nbsp;&nbsp;•&nbsp;&nbsp; {data.phone} &nbsp;&nbsp;•&nbsp;&nbsp; {data.location}
                        </div>
                    </div>

                    <div style={{ padding: '0 60px 60px', flex: 1 }}>
                        
                        {/* Summary Block */}
                        <div style={{ marginBottom: '50px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '-10px', width: '30px', height: '2px', backgroundColor: templateConfig.accentColor }}></div>
                            <p style={{ fontSize: '14px', lineHeight: '2', color: '#475569', textAlign: 'center', maxWidth: '90%', margin: '0 auto', fontWeight: '500' }}>
                                {data.summary}
                            </p>
                        </div>

                        {/* Layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px' }}>
                            
                            {/* Experience */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h2 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', borderBottom: `4px solid #f1f5f9`, paddingBottom: '10px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    Record of Deployment
                                </h2>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h3>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: templateConfig.accentColor, fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Skills tags */}
                            <div>
                                <h2 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', borderBottom: `4px solid #f1f5f9`, paddingBottom: '10px', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    Tech Stack
                                </h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ fontSize: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '2px', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h2 style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', borderBottom: `4px solid #f1f5f9`, paddingBottom: '10px', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    Academic Log
                                </h2>
                                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line', fontWeight: '600' }}>
                                    {data.education}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div style={{ height: '50px', backgroundColor: '#1e293b', marginTop: 'auto', display: 'flex', alignItems: 'center', padding: '0 60px', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '3px' }}>SYSTEM_MOD_2026</div>
                        {generatedCvNumber && (
                          <div style={{ fontSize: '9px', fontWeight: '800', color: templateConfig.accentColor, letterSpacing: '3px' }}>REF_{generatedCvNumber}</div>
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