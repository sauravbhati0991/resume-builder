import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Microscope, GraduationCap, ShieldCheck, FileCheck 
} from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81] transition-all" 
    />
  </div>
);

export default function GraduateFellowEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Graduate Fellow Elite",
    primaryColor: "#312e81", 
    accentColor: "#eef2ff",  
    defaultData: {
      firstName: "Michael",
      lastName: "Chang",
      title: "NSF Graduate Research Fellow",
      email: "m.chang@grad.edu",
      phone: "+1 555 404 5050",
      location: "Ann Arbor, MI",
      summary: "Highly motivated Graduate Research Fellow studying applied machine learning in structural engineering. Recipient of the National Science Foundation (NSF) Fellowship. Experienced in leading undergraduate research teams and assisting in grant proposal preparation.",
      skills: "Machine Learning (PyTorch, TensorFlow), Structural Analysis, Data Visualization, Academic Writing, Statistical Modeling, Lecturing",
      experience: [
        { role: "Graduate Research Assistant", company: "University of Michigan", dates: "2021 - Present", description: "Design machine learning models to predict structural fatigue in concrete. Supervise 3 undergraduate researchers in data collection and coding." },
        { role: "Engineering Intern", company: "BuildTech Solutions", dates: "2019 - 2021", description: "Assisted senior engineers in drafting CAD models for commercial buildings. Conducted material stress tests." }
      ],
      education: "M.S. Structural Engineering, Univ. of Michigan (Exp. 2024)\nB.S. Civil Engineering (2021)"
    }
  };

  // State Management
  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
        const [zoom, setZoom] = useState(0.8);

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
    <div className="min-h-screen w-full bg-[#fcfcfd] flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"><ArrowLeft size={18} /></button>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                    <Microscope size={20} className="text-[#312e81]"/>
                    <span className="font-bold text-slate-700 tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 transition-all">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} Save Progress
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="px-5 py-2 text-sm font-bold text-white bg-[#312e81] rounded-lg shadow-md hover:bg-[#252361] transition-all flex items-center gap-2">
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <><Download size={16} /> Export Fellowship CV</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* EDITOR SIDE */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <UserIcon size={16}/> Scholar Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Fellowship Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Academic Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Institution Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-4">Research Objective</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#312e81] outline-none bg-slate-50/30 leading-relaxed"/>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em]">Academic Experience</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold bg-[#312e81] text-white px-3 py-1.5 rounded uppercase tracking-widest">+ Add Record</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role / Assistantship" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Lab / Institution" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Tenure Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#312e81] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-[#312e81] uppercase tracking-[0.2em] mb-4">Methodology & Education</h3>
                    <InputGroup label="Core Skills / Lab Techniques" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education History" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW SIDE */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div 
                    ref={previewRef} 
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm', 
                        backgroundColor: 'white', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        position: 'relative',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}
                >
                    <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 50px', borderBottom: `8px solid ${templateConfig.accentColor}` }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '16px', color: templateConfig.accentColor, fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{data.title}</h2>
                        
                        <div style={{ display: 'flex', gap: '20px', marginTop: '25px', fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '45px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Research Statement</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155', textAlign: 'justify' }}>{data.summary}</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Academic & Professional Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: templateConfig.primaryColor, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', fontStyle: 'italic', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Methodology & Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data.skills.split(',').map((s, i) => (
                                        <span key={i} style={{ fontSize: '11px', color: '#334155', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '3px', fontWeight: '600' }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Education</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      

      

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

const UserIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);