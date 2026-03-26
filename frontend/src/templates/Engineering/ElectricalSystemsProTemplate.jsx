import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Zap, Mail, Phone, MapPin, Cpu, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tight">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all" 
    />
  </div>
);

export default function ElectricalSystemsProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Electrical Systems Pro",
    primaryColor: "#334155", // Slate Steel
    accentColor: "#F59E0B",  // High-Voltage Amber
    defaultData: {
      firstName: "Marcus",
      lastName: "Trent",
      title: "Electrical Systems Engineer",
      email: "m.trent@electro.com",
      phone: "+1 555 987 6543",
      location: "Austin, TX",
      summary: "Innovative Electrical Engineer with deep expertise in power distribution systems and PLC programming. Adept at designing low and medium voltage architectures that maximize energy efficiency and comply with NEC standards.",
      skills: "AutoCAD Electrical, PLC Programming, Power Systems Analysis, PCB Design, SCADA Systems, MATLAB",
      experience: [
        { role: "Electrical Engineer", company: "Volt Power Solutions", dates: "2020 - Present", description: "Designed medium-voltage distribution systems for commercial data centers. Programmed and commissioned PLC architectures, improving system automation reliability by 25%." },
        { role: "Junior Controls Engineer", company: "Industrial Automation Inc.", dates: "2016 - 2020", description: "Assisted in the design of motor control centers (MCCs) and HMI interfaces for manufacturing plants." }
      ],
      education: "B.S. in Electrical Engineering, Texas A&M (2016)"
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* COMMAND BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-50 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700 uppercase tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save System
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-md hover:brightness-110 disabled:opacity-70 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2 text-amber-400" />} Generate PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* SCHEMATIC EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-widest"><Zap className="w-4 h-4 text-amber-500" /> System Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Engineer Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-700">Executive Brief</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-slate-500 outline-none leading-relaxed bg-slate-50 font-mono"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Project History</h3><button onClick={addExperience} className="text-xs text-blue-600 font-bold hover:underline">+ Add Project</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} placeholder="Quantify impact (e.g., voltage improved, efficiency gained...)" id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-700">Tech Stack & Pedigree</h3>
                    <InputGroup label="Technical Skills (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic History" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* BLUEPRINT PREVIEW */}
            <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
                    
                    {/* Dark Steel Sidebar */}
                    <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '45px 30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                            <Zap size={56} color={templateConfig.accentColor} strokeWidth={2.5} />
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px', lineHeight: '1.1' }}>{data.firstName}<br/>{data.lastName}</h1>
                        <h2 style={{ fontSize: '11px', color: templateConfig.accentColor, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '45px' }}>{data.title}</h2>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Point of Contact</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.9 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={14} color={templateConfig.accentColor}/> <span style={{wordBreak:'break-all'}}>{data.email}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={14} color={templateConfig.accentColor}/> {data.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={14} color={templateConfig.accentColor}/> {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Technical Stack</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                                        <div style={{ width: '8px', height: '2px', backgroundColor: templateConfig.accentColor }}></div>
                                        {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Pedigree</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.7', opacity: 0.9, whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                        </div>
                    </div>

                    {/* Schematic Main Content */}
                    <div style={{ width: '65%', padding: '50px' }}>
                        
                        <section style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Executive Brief</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.75', color: '#334155', margin: 0 }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>Project History & Career Path</h3>
                            <div style={{ position: 'relative', borderLeft: `2px solid #e2e8f0`, paddingLeft: '30px', marginLeft: '6px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', width: '14px', height: '14px', backgroundColor: 'white', border: `3px solid ${templateConfig.accentColor}`, borderRadius: '50%', left: '-38px', top: '4px', zIndex: 1 }}></div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: templateConfig.accentColor, marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                                        <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* System Verification Footer */}
                    
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