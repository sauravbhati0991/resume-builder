import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, Award, Shield, Database, Briefcase, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function CaEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "CA Elite",
    primaryColor: "#14532d", // Deep Forest Green
    accentColor: "#fbbf24",  // Amber Gold
    defaultData: {
      firstName: "Neha",
      lastName: "Sharma",
      title: "Chartered Accountant (CA)",
      email: "neha.sharma@ca-firm.com",
      phone: "+91 98765 43210",
      location: "Mumbai, India",
      summary: "Highly meticulous Chartered Accountant with 7 years of post-qualification experience in statutory auditing, corporate taxation, and financial compliance. Expert in navigating complex tax frameworks and advising corporations on financial restructuring.",
      skills: "Statutory Audit, Direct & Indirect Tax, IFRS/Ind AS, Financial Restructuring, SAP ERP, Advanced Excel, Risk Assessment",
      experience: [
        { role: "Senior Audit Manager", company: "KPMG Solutions", dates: "2020 - Present", description: "Manage statutory audits for 10+ publicly listed companies. Identified compliance gaps that saved clients over ₹1.5 Cr in potential penalties and optimized tax workflows." },
        { role: "Tax Consultant", company: "Deloitte India", dates: "2017 - 2020", description: "Prepared corporate tax returns and handled scrutiny assessments. Advised clients on GST implementation strategies and cross-border taxation." }
      ],
      education: "Chartered Accountant (ICAI), All India Rank 45 (2017)\nB.Com, Mumbai University (2014)"
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

  // Quick Draft Sync
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
      
      {/* PROFESSIONAL TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-b-4 border-green-800 shadow-md rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase border rounded flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_BUILDER
                </button>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-800" />
                  <span className="font-black text-sm uppercase tracking-tighter">{templateConfig.name} Profile</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} SECURE_DRAFT
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-black h-9 px-6 rounded bg-green-900 text-white hover:bg-green-950 transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} EXPORT_CERTIFIED_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-4">
            
            {/* INPUT SECTION */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-green-800 uppercase tracking-widest border-b pb-2">Profile Credentials</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Given Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Surname" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Chartered Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Professional Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Jurisdiction/Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-green-800 border-b pb-2">Professional Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 p-4 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-green-800 focus:outline-none mt-2"/>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-green-800">Experience Ledger</h3>
                        <button onClick={addExperience} className="text-[10px] bg-green-800 text-white px-3 py-1 font-bold rounded uppercase">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded-lg border-2 border-slate-50 bg-white relative group shadow-sm">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Firm / Corporation" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Tenure Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Key audits, tax filings, and leadership responsibilities..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-3 text-sm mt-1 outline-none focus:border-green-800"/>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* PREVIEW SECTION */}
            <div className="h-full bg-slate-400 flex justify-center p-8 overflow-auto custom-scrollbar shadow-inner rounded-xl">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex' }}>
                    
                    <div style={{ width: '38%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '60px 40px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase', marginBottom: '10px' }}>
                                {data.firstName}<br/><span style={{ color: templateConfig.accentColor }}>{data.lastName}</span>
                            </h1>
                            <div style={{ height: '4px', width: '40px', backgroundColor: templateConfig.accentColor, marginBottom: '15px' }}></div>
                            <p style={{ fontSize: '12px', color: templateConfig.accentColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</p>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Direct Contact</h3>
                            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '15px', color: '#ecfdf5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={14} color={templateConfig.accentColor}/> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Phone size={14} color={templateConfig.accentColor}/> {data.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={14} color={templateConfig.accentColor}/> {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '45px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Audit & Expertise</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', color: '#ecfdf5', display: 'flex', gap: '10px', alignItems: 'flex-start', fontWeight: '500' }}>
                                        <div style={{ marginTop: '5px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: templateConfig.accentColor }}></div>
                                        <span style={{ lineHeight: '1.4' }}>{skill.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Education</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.8', color: '#ecfdf5', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                        </div>
                    </div>

                    <div style={{ width: '62%', padding: '60px 50px', display: 'flex', flexDirection: 'column' }}>
                        
                        <section style={{ marginBottom: '50px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Award size={20} color={templateConfig.primaryColor} />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', margin: 0 }}>Executive Profile</h3>
                            </div>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#334155', fontWeight: '500' }}>{data.summary}</p>
                        </section>

                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <Briefcase size={20} color={templateConfig.primaryColor} />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', margin: 0 }}>Professional Ledger</h3>
                            </div>
                            
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '35px', position: 'relative', borderLeft: `2px solid #e2e8f0`, paddingLeft: '25px' }}>
                                    <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: templateConfig.primaryColor }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        
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