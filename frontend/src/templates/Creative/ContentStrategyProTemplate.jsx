import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, BookOpen, BarChart, PenTool, Globe, Database } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all" 
    />
  </div>
);

export default function ContentStrategyProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Content Strategy Pro",
    primaryColor: "#4A1D96", // Deep Editorial Purple
    accentColor: "#FDE047",  // Highlighter Yellow
    defaultData: {
      firstName: "Rachel",
      lastName: "Gomez",
      title: "Lead Content Strategist",
      email: "rachel.content@example.com",
      phone: "+1 555 888 9999",
      location: "Austin, TX",
      summary: "Strategic storyteller and content architect. I specialize in building scalable content ecosystems that drive organic traffic, foster community engagement, and align with core brand narratives across B2B and B2C sectors.",
      skills: "Content Strategy, SEO Copywriting, Editorial Calendars, Brand Voice, CMS Management, Content Audits, Google Analytics",
      experience: [
        { role: "Lead Content Strategist", company: "Digital Narrative Agency", dates: "2019 - Present", description: "Developed and executed a content strategy for a SaaS client that increased organic blog traffic by 150% in 6 months. Manage a team of 5 freelance writers and established quarterly content audits." },
        { role: "Senior Copywriter", company: "Tech Innovations", dates: "2015 - 2019", description: "Authored whitepapers, case studies, and email drip campaigns. Established the company's first comprehensive style guide and reduced bounce rates by 22%." }
      ],
      education: "B.A. in English & Journalism, UT Austin (2015)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* EDITORIAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-100 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> EXIT</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => saveResume()} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* CONTENT EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mt-4">
                    <h3 className="text-xs font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-widest border-b pb-2">Author Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Headline Role" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Current Base" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Mission Statement</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none leading-relaxed bg-slate-50 font-sans"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Editorial History</h3><button onClick={addExperience} className="text-xs text-purple-600 font-bold hover:underline tracking-tight">+ Add Role</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Date Range" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Focus on metrics: traffic growth, lead gen, conversion..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Knowledge Base</h3>
                    <InputGroup label="Strategic Expertise" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic History" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* STRATEGY PREVIEW */}
            <div className="h-full bg-slate-300 flex justify-center p-8 overflow-auto custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    
                    {/* Editorial Sidebar */}
                    <div style={{ width: '38%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '45px 35px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <h1 style={{ fontSize: '38px', fontWeight: '900', lineHeight: '1', margin: 0, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                                {data.firstName}<br/>
                                <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ width: '40px', height: '4px', backgroundColor: templateConfig.accentColor, marginTop: '20px' }}></div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#d8b4fe', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={14}/> Distribution
                            </h3>
                            <div style={{ fontSize: '12px', color: '#e9d5ff', display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: '500' }}>
                                <div>{data.email}</div>
                                <div>{data.phone}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart size={14}/> Expertise
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', color: 'white', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontWeight: '600' }}>
                                        {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={14}/> Academy
                            </h3>
                            <p style={{ fontSize: '11px', color: '#e9d5ff', lineHeight: '1.7', whiteSpace: 'pre-line', fontWeight: '500' }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ width: '62%', padding: '50px 45px', display: 'flex', flexDirection: 'column' }}>
                        
                        <section style={{ marginBottom: '50px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b4b', position: 'relative', display: 'inline-block' }}>
                                    <span style={{ position: 'relative', zIndex: 1 }}>Mission Summary</span>
                                    <span style={{ position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '10px', backgroundColor: templateConfig.accentColor, zIndex: 0, opacity: 0.8 }}></span>
                                </h3>
                            </div>
                            <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#334155', margin: 0, fontWeight: '500' }}>{data.summary}</p>
                        </section>

                        <section style={{ flex: 1 }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e1b4b', position: 'relative', display: 'inline-block' }}>
                                    <span style={{ position: 'relative', zIndex: 1 }}>Content Architecture</span>
                                    <span style={{ position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '10px', backgroundColor: templateConfig.accentColor, zIndex: 0, opacity: 0.8 }}></span>
                                </h3>
                            </div>
                            
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '2px', height: '100%', backgroundColor: '#f1f5f9' }}></div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: templateConfig.primaryColor, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{exp.company}</span>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        {/* Narrative Verification Footer */}
                        
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