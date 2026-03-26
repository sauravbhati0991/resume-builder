import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Briefcase, GraduationCap, Settings2, Globe, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
    />
  </div>
);

export default function ProjectEngineerModernTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Project Engineer Modern",
    primaryColor: "#0F172A", // Deep Navy
    accentColor: "#10B981",  // Emerald (Success/Growth)
    defaultData: {
      firstName: "Samantha",
      lastName: "Reed",
      title: "Senior Project Engineer",
      email: "s.reed@engineering.com",
      phone: "+1 555 333 4444",
      location: "Denver, CO",
      summary: "Strategic Project Engineer with 8 years of experience overseeing large-scale civil and commercial construction projects from bidding to closeout. Skilled in cross-functional team leadership, budget tracking, and mitigating project risks.",
      skills: "Primavera P6, MS Project, Procore, Budget Forecasting, Risk Management, Contract Negotiation, Quality Assurance",
      experience: [
        { role: "Senior Project Engineer", company: "Summit Construction", dates: "2018 - Present", description: "Managed a $45M commercial development project. Coordinated RFI/Submittal logs and ensured compliance with local building codes, finishing 3 weeks ahead of schedule." },
        { role: "Project Engineer", company: "Highland Builders", dates: "2015 - 2018", description: "Assisted PMs in budget tracking and scheduling for residential projects. Facilitated weekly subcontractor coordination meetings." }
      ],
      education: "B.S. Construction Management, Colorado State University"
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

  // Local Sync
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
      
      {/* STEERING BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-100 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Progress
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-lg hover:brightness-110 disabled:opacity-70 transition-all" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export Document
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* BUILDER PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-widest"><Globe className="w-4 h-4 text-blue-500" /> Core Logistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Given Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Surname" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Project Role" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Primary Region" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Executive Brief</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed bg-slate-50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Project History</h3><button onClick={addExperience} className="text-xs text-emerald-600 font-bold hover:underline tracking-tight">+ Add Entry</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe project scale, budgets, and outcomes..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Competencies & Credentials</h3>
                    <InputGroup label="Project Tools & Skills" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Highest Education" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '50px 60px 40px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <h1 style={{ fontSize: '44px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 10px 0', lineHeight: '1' }}>
                            {data.firstName} <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                        </h1>
                        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
                            {data.title}
                        </h2>
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', fontSize: '12px', color: '#475569', fontWeight: '700' }}>
                            <span>{data.email}</span>
                            <span style={{ width: '4px', height: '4px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></span>
                            <span>{data.phone}</span>
                            <span style={{ width: '4px', height: '4px', backgroundColor: templateConfig.accentColor, borderRadius: '50%' }}></span>
                            <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '35px 60px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', textAlign: 'center', fontWeight: '500', maxWidth: '800px', margin: '0 auto' }}>{data.summary}</p>
                        </div>

                        <div style={{ padding: '50px 60px', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '50px' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Briefcase size={16} color={templateConfig.accentColor} /> Project Experience
                                </h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: templateConfig.accentColor, fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div style={{ marginBottom: '45px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Settings2 size={16} color={templateConfig.accentColor} /> Capabilities
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {data.skills.split(',').map((skill, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#1e293b', borderLeft: `3px solid ${templateConfig.accentColor}`, paddingLeft: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <GraduationCap size={16} color={templateConfig.accentColor} /> Education
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', fontWeight: '700', margin: 0 }}>{data.education}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with CV ID Sync */}
                    
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