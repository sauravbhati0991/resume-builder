import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Download, Trash2, Loader2, Landmark, Briefcase, GraduationCap, PenTool, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-[0.1em]">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 transition-all font-medium text-slate-800" 
    />
  </div>
);

export default function InvestmentBankerProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Investment Banker Pro",
    primaryColor: "#001f3f", // Navy Blue (Institutional)
    accentColor: "#d4af37",  // Metallic Gold
    defaultData: {
      firstName: "William",
      lastName: "Prescott",
      title: "Vice President, Investment Banking",
      email: "w.prescott@finance.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      summary: "Results-driven Investment Banker with 8+ years of experience in M&A advisory, capital raising, and corporate restructuring. Executed over $2B in transaction volume across the technology and healthcare sectors. Expert in complex financial modeling and strategic valuation.",
      skills: "Financial Modeling (LBO, DCF, M&A), Valuation Analysis, Due Diligence, Capital Markets, Bloomberg Terminal, FactSet, SQL",
      experience: [
        { role: "Vice President, M&A", company: "Goldman & Partners", dates: "2019 - Present", description: "Lead deal execution for sell-side M&A transactions. Supervise and mentor a team of 4 associates and analysts. Closed a $500M cross-border acquisition in Q3 2022, managing the entire valuation process and board presentations." },
        { role: "Investment Banking Associate", company: "Capital Markets LLC", dates: "2015 - 2019", description: "Built complex 3-statement financial models and prepared comprehensive pitchbooks for tech sector clients. Conducted rigorous financial due diligence for 3 successful IPOs." }
      ],
      education: "MBA in Finance, Wharton School of Business (2015)\nB.S. in Economics, NYU (2011)"
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

  // Quick Local Sync (Drafting)
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
      
      {/* INSTITUTIONAL HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-[#001f3f] shadow-2xl rounded-lg p-4 flex justify-between items-center border-b-4 border-[#d4af37]">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 h-9 px-4 uppercase rounded flex items-center transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" /> EXIT_SESSION
                </button>
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#d4af37]" />
                  <span className="font-bold text-sm text-white uppercase tracking-[0.2em]">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="text-[10px] font-bold h-9 px-4 rounded bg-white/10 text-white hover:bg-white/20 transition-all uppercase flex items-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} SECURE_SAVE
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-[10px] font-black h-9 px-6 rounded bg-[#d4af37] text-blue-950 hover:bg-[#c4a137] transition-all uppercase tracking-widest flex items-center shadow-lg">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} GENERATE_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full mt-6">
            
            {/* INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
                    <h3 className="text-xs font-black mb-6 text-slate-900 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Identity & Contact</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Official Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Secure Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Direct Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Office Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Professional Mandate</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 p-4 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none mt-2"/>
                </div>

                <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
                     <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Transaction & Work History</h3>
                        <button onClick={addExperience} className="text-[10px] bg-blue-900 text-white px-3 py-1 font-bold rounded uppercase hover:bg-blue-800 transition-colors">+ New Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded bg-slate-50 relative group border border-slate-200">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Seniority/Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Financial Institution" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Tenure" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={4} placeholder="Closed deals, deal size, sector focus, and modeling expertise..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-3 text-sm mt-1 outline-none focus:border-blue-900 bg-white"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 rounded-md border-t-4 border-blue-900 shadow-sm">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2 flex items-center gap-2"><PenTool className="w-4 h-4"/> Technical Arsenal</h3>
                    <InputGroup label="Core Skills (M&A, DCF, LBO...)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-6"></div>
                    <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-900 border-b pb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Academic Credentials</h3>
                    <textarea rows={3} value={data.education} id="education" name="education" onChange={handleInputChange} className="w-full border rounded p-3 text-sm focus:border-blue-900 outline-none"/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-600 flex justify-center p-12 overflow-auto custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '60px 80px', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '15px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px', lineHeight: '1' }}>
                            {data.firstName} {data.lastName}
                        </h1>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                            {data.location} • {data.phone} • {data.email}
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <p style={{ fontSize: '12px', lineHeight: '1.5', textAlign: 'justify', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            {data.summary}
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                            Professional Experience
                        </h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{exp.company}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '6px' }}>{exp.role}</div>
                                <p style={{ fontSize: '12px', lineHeight: '1.4', textAlign: 'justify', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                            Education
                        </h3>
                        <p style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '12px', paddingBottom: '2px' }}>
                            Skills & Additional Information
                        </h3>
                        <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                            <strong>Technical Proficiencies:</strong> {data.skills}
                        </p>
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