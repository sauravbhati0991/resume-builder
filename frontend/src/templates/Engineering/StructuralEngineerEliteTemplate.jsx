import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Box, Award, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-black text-slate-500 mb-1 block uppercase tracking-[0.1em]">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-slate-900 transition-all font-sans" 
    />
  </div>
);

export default function StructuralEngineerEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Structural Engineer Elite",
    primaryColor: "#334155", // Slate 700 (Structural Steel)
    accentColor: "#C2410C",  // Orange 700 (Safety/Construction)
    defaultData: {
      firstName: "Elias",
      lastName: "Vance",
      title: "Senior Structural Engineer, PE",
      email: "e.vance@struct.com",
      phone: "+1 555 876 5432",
      location: "Chicago, IL",
      summary: "Licensed Professional Engineer (PE) with 10+ years of experience in structural analysis and design for high-rise commercial buildings and bridge infrastructure. Expert in seismic retrofitting and finite element analysis.",
      skills: "AutoCAD, Revit, SAP2000, ETABS, Steel Design, Concrete Design, Seismic Analysis, Bluebeam",
      experience: [
        { role: "Lead Structural Engineer", company: "Apex Engineering Group", dates: "2018 - Present", description: "Led structural design for the $120M Riverfront Tower project. Performed dynamic seismic analysis using ETABS and optimized steel framing to reduce material costs by 12%." },
        { role: "Structural Designer", company: "Urban Build Associates", dates: "2014 - 2018", description: "Designed reinforced concrete foundations for mid-rise structures. Drafted structural details and coordinated with architectural teams via Revit." }
      ],
      education: "M.S. Structural Engineering, UIUC (2014)\nB.S. Civil Engineering, Purdue (2012)"
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

  // Local Sync (Quick Save)
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
    <div className="min-h-screen w-full bg-slate-200 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-lg p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-xs font-bold hover:bg-slate-700 h-8 px-3 rounded border border-slate-600 transition-all uppercase tracking-widest"><ArrowLeft className="w-3 h-3 mr-2" /> EXIT</button>
                <div className="h-4 w-px bg-slate-600"></div>
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-orange-500" />
                  <span className="font-black text-sm uppercase tracking-[0.2em]">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-xs font-black h-8 px-4 rounded bg-slate-700 hover:bg-slate-600 border border-slate-500 transition-all uppercase">
                    {isSaving ? <Loader2 className="w-3 h-3 mr-2 animate-spin"/> : <Database className="w-3 h-3 mr-2" />} Sync_Cloud
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-xs font-black h-8 px-4 rounded text-white shadow-lg hover:brightness-110 transition-all uppercase" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <Loader2 className="w-3 h-3 mr-2 animate-spin"/> : <Download className="w-3 h-3 mr-2" />} Export_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* INPUT PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded shadow-sm p-6 border-t-4 border-slate-800">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-widest border-b pb-2"><ShieldCheck className="w-4 h-4" /> Personnel_Specs</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="First_Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last_Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Professional_Designation" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email_Address" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact_Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Home_Station" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded shadow-sm p-6 border-t-4 border-slate-800">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Executive_Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-none p-3 text-sm focus:border-orange-700 outline-none leading-relaxed bg-slate-50 font-sans"/>
                </div>

                <div className="bg-white rounded shadow-sm p-6 border-t-4 border-slate-800">
                     <div className="flex justify-between mb-4"><h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Project_History</h3><button onClick={addExperience} className="text-[10px] text-orange-700 font-black hover:underline uppercase tracking-widest">+ Add_Project</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role_ID" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Firm_Name" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe finite element analysis, material optimization, and project values..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded-none p-2 text-sm focus:border-orange-700 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded shadow-sm p-6 border-t-4 border-slate-800">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-800">Technical_Stack</h3>
                    <InputGroup label="Core_Competencies" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic_Credentials" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* BLUEPRINT PREVIEW */}
            <div className="h-full bg-slate-400 rounded overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ padding: '45px 50px 35px', borderBottom: `10px solid ${templateConfig.primaryColor}`, backgroundColor: '#fff' }}>
                        <div style={{ borderLeft: `8px solid ${templateConfig.accentColor}`, paddingLeft: '25px' }}>
                            <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0', lineHeight: '0.9' }}>
                                {data.firstName}<br/>{data.lastName}
                            </h1>
                            <h2 style={{ fontSize: '15px', color: templateConfig.primaryColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px', marginTop: '10px' }}>
                                {data.title}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '30px', fontSize: '11px', color: '#475569', marginTop: '25px', fontWeight: '700', textTransform: 'uppercase' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} color={templateConfig.accentColor}/> {data.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} color={templateConfig.accentColor}/> {data.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12} color={templateConfig.accentColor}/> {data.location}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flex: 1, padding: '45px 50px' }}>
                        <div style={{ flex: 2, paddingRight: '45px', borderRight: '1px solid #e2e8f0' }}>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', backgroundColor: templateConfig.primaryColor, color: 'white', display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px' }}>Structural_Profile</h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.7', color: '#334155', margin: 0 }}>{data.summary}</p>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '13px', fontWeight: '900', backgroundColor: templateConfig.primaryColor, color: 'white', display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '2px' }}>Operational_Log</h3>
                                
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid #cbd5e1`, paddingBottom: '6px', marginBottom: '10px' }}>
                                            <h4 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>

                        <div style={{ flex: 1, paddingLeft: '45px' }}>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Tech_Stack</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', color: '#1e293b', border: `1px solid #e2e8f0`, padding: '8px 12px', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Box size={10} color={templateConfig.accentColor} /> {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Credentials</h3>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <Award size={18} color={templateConfig.accentColor} />
                                    <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line', margin: 0, fontWeight: '700' }}>{data.education}</p>
                                </div>
                            </section>

                            {/* CV ID Server-Sync Verification */}
                            
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