import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, BarChart2, Activity, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tight">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all font-sans" 
    />
  </div>
);

export default function ReliabilityEngineerProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Reliability Engineer Pro",
    primaryColor: "#34495E", // Deep Charcoal/Navy
    accentColor: "#E74C3C",  // Signal Red
    defaultData: {
      firstName: "Julian",
      lastName: "Reyes",
      title: "Senior Reliability Engineer",
      email: "j.reyes@reliability.com",
      phone: "+1 555 888 7777",
      location: "Houston, TX",
      summary: "Analytical Reliability Engineer focused on improving asset uptime, MTBF, and overall equipment effectiveness (OEE). Expert in Root Cause Failure Analysis (RCFA) and implementing predictive maintenance programs in heavy manufacturing environments.",
      skills: "FMEA/FMECA, Root Cause Analysis, Predictive Maintenance, Weibull Analysis, Python Data Analytics, CMMS (Maximo), Lean Six Sigma",
      experience: [
        { role: "Reliability Engineer", company: "Global Manufacturing Inc.", dates: "2019 - Present", description: "Implemented a vibration analysis program that predicted 3 major catastrophic failures, saving $400k in downtime. Facilitated cross-functional RCFA meetings and reduced Mean Time to Repair (MTTR) by 12%." },
        { role: "Maintenance Engineer", company: "SteelWorks Corp", dates: "2015 - 2019", description: "Developed preventive maintenance PMs for hydraulic stamping presses. Increased OEE by 15% over a two-year period through asset lifecycle optimization." }
      ],
      education: "B.S. Mechanical Engineering, Texas Tech (2015)\nCertified Reliability Engineer (CRE)"
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* ANALYTICAL CONTROL BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-300 shadow-sm rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-50 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> EXIT</button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} Sync Data
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-bold h-9 px-4 rounded-md text-white shadow-lg hover:brightness-110 disabled:opacity-70 transition-all uppercase" style={{ backgroundColor: templateConfig.primaryColor }}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* DATA ENTRY PANEL */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-widest border-b pb-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Identity Verification</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Professional Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email Contact" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Comm. Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Primary Base" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Analytical Profile</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-slate-500 outline-none leading-relaxed bg-slate-50 font-sans"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                     <div className="flex justify-between mb-4"><h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Uptime History</h3><button onClick={addExperience} className="text-xs text-blue-600 font-bold hover:underline tracking-tight">+ Add Role</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Date Range" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Quantify reliability gains (MTBF, MTTR, Savings)..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-800">Asset Management Tools</h3>
                    <InputGroup label="Skills (Separated by commas)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic History & CRE" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* ANALYTICAL PREVIEW */}
            <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '45px 55px', borderBottom: `4px solid ${templateConfig.primaryColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                        <div>
                            <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#1a202c', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '-1px' }}>{data.firstName} <span style={{ color: templateConfig.accentColor }}>{data.lastName}</span></h1>
                            <h2 style={{ fontSize: '16px', color: templateConfig.primaryColor, fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>{data.title}</h2>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#4a5568', fontWeight: '600', lineHeight: '1.7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ padding: '45px 55px', display: 'flex', gap: '50px', flex: 1 }}>
                        <div style={{ flex: 1.8 }}>
                            <section style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '1px' }}>
                                    <BarChart2 size={18} color={templateConfig.accentColor}/> Analytical Profile
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.7', color: '#334155', margin: 0 }}>{data.summary}</p>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '25px', borderBottom: '1.5px solid #edf2f7', paddingBottom: '8px', letterSpacing: '1px' }}>System Reliability History</h3>
                                
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '30px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: templateConfig.accentColor, fontWeight: '900', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px' }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', marginBottom: '10px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>
                        </div>

                        <div style={{ flex: 1 }}>
                            <section style={{ marginBottom: '45px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '25px', borderBottom: '1.5px solid #edf2f7', paddingBottom: '8px', letterSpacing: '1px' }}>Tool Proficiency</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {data.skills.split(',').map((skill, i) => {
                                        const width = 80 + (i % 3) * 7; 
                                        return (
                                        <div key={i}>
                                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>{skill.trim()}</div>
                                            <div style={{ width: '100%', height: '5px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${width}%`, height: '100%', backgroundColor: templateConfig.accentColor, borderRadius: '10px' }}></div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1.5px solid #edf2f7', paddingBottom: '8px', letterSpacing: '1px' }}>Credentials</h3>
                                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </section>

                            {/* CV ID Footer for Tracking */}
                            
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