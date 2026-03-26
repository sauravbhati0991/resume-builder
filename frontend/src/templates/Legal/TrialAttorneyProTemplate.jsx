import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Gavel, Scale, Award, BookOpen, UserCheck, ScrollText,
  Database, ShieldCheck, CheckCircle2, AlertCircle, FileLock
} from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full border-b-2 border-slate-200 bg-transparent px-1 py-2 text-sm focus:outline-none focus:border-[#00008B] transition-colors font-medium text-slate-700" 
    />
  </div>
);

export default function TrialAttorneyProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Trial Attorney Pro",
    primaryColor: "#00008B", 
    accentColor: "#F5F5DC",  
    defaultData: {
      firstName: "Jessica",
      lastName: "Pearson",
      title: "Lead Trial Attorney",
      email: "j.pearson@litigation.com",
      phone: "+1 555 888 2222",
      location: "Washington, D.C.",
      summary: "Accomplished Trial Attorney with over 15 years of courtroom experience in complex civil litigation. Dedicated advocate known for delivering compelling opening/closing statements, aggressive cross-examinations, and securing highly favorable verdicts for corporate clients.",
      skills: "Civil Litigation, Cross-Examination, Depositions, Dispute Resolution, Appellate Practice, Legal Strategy, Mediation",
      experience: [
        { role: "Partner / Lead Litigator", company: "Pearson Legal Group", dates: "2016 - Present", description: "Serve as first-chair counsel in over 30 jury trials. Secured a landmark $45M defense verdict in a corporate fraud case. Supervise trial preparation and mock juries." },
        { role: "Associate Attorney", company: "State Prosecution Office", dates: "2009 - 2016", description: "Prosecuted white-collar crimes. Conducted over 100 depositions and drafted appellate briefs." }
      ],
      education: "Juris Doctor (J.D.), Georgetown University (2009)\nB.A. English, Stanford University (2006)"
    }
  };

  // MASTER PATTERN STATE MANAGEMENT
  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
      
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
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* ATTORNEY BAR HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <Gavel size={22} className="text-[#00008B]"/>
            <h2 className="font-serif font-bold text-slate-900 tracking-tight text-lg italic">Attorney Pro Console <span className="text-slate-400 font-sans text-xs font-normal not-italic ml-2">v4.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 rounded border-2 border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Vault Sync
          </button>
          <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-[#00008B] text-white px-8 py-2 rounded font-bold text-[10px] uppercase tracking-[0.15em] shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <ScrollText size={14} />} 
            Finalize Filing
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full overflow-hidden flex gap-8">
        {/* LITIGATION INPUTS */}
        <div className="w-[45%] overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-32">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b pb-4">
                   <UserCheck size={18} className="text-[#00008B]"/> Practitioner Identity
                </h3>
                <div className="grid grid-cols-2 gap-8">
                    <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                    <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                    <InputGroup label="Trial Designation" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                    <InputGroup label="Professional Email" name="email" value={data.email} onChange={handleInputChange}/>
                    <InputGroup label="Direct Dial" name="phone" value={data.phone} onChange={handleInputChange}/>
                    <InputGroup label="Office Locale" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Litigation Summary</h3>
                <textarea rows={5} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border-l-4 border-[#00008B] bg-slate-50 p-4 text-sm focus:outline-none text-slate-700 italic font-serif leading-relaxed shadow-inner font-medium"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trial History</h3>
                    <button onClick={addExperience} className="text-[10px] font-black text-[#00008B] border-b-2 border-[#00008B] uppercase tracking-widest">+ ADD PROCEEDING</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-10 relative group border-b border-slate-100 pb-8 hover:bg-slate-50/50 transition-colors px-4 pt-4 rounded-lg">
                        <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Position" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Law Firm / Agency" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Period of Counsel" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                            <textarea rows={3} placeholder="Highlight jury wins, major settlements, or first-chair responsibilities..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border-slate-200 border rounded-lg p-4 text-sm text-slate-600 font-serif leading-relaxed focus:ring-2 focus:ring-blue-100 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* COURT PREVIEW */}
        <div className="w-[55%] flex justify-center overflow-y-auto custom-scrollbar bg-slate-300/40 rounded-3xl p-10 shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontFamily: '"Georgia", serif' }}>
                
                {/* Centered Formal Header */}
                <div style={{ textAlign: 'center', padding: '60px 60px 30px', borderBottom: `1px solid rgba(0,0,139,0.2)`, margin: '0 50px' }}>
                    <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>
                        {data.firstName} {data.lastName}
                    </h1>
                    <h2 style={{ fontSize: '14px', color: '#111', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px' }}>{data.title}</h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '11px', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span>{data.email}</span> 
                        <span style={{ color: templateConfig.primaryColor }}>•</span> 
                        <span>{data.phone}</span> 
                        <span style={{ color: templateConfig.primaryColor }}>•</span> 
                        <span>{data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '45px 75px', flex: 1 }}>
                    <section style={{ marginBottom: '45px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Professional Overview</h3>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                        </div>
                        <p style={{ fontSize: '13px', lineHeight: '1.9', color: '#111', textAlign: 'justify', fontStyle: 'italic' }}>{data.summary}</p>
                    </section>

                    <section style={{ marginBottom: '45px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Trial Experience</h3>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                        </div>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '35px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.company}</h4>
                                    <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontStyle: 'italic', marginBottom: '12px', fontWeight: 'bold' }}>{exp.role}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#222', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
                        <section>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>Admissions & Skills</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.9', color: '#111', fontStyle: 'italic' }}>{data.skills}</p>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#111', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {/* ARCHIVE FOOTER */}
                
            </div>
        </div>
      </div>

      {/* MASTER CONFIRMATION MODAL */}
      

      {/* MASTER SUCCESS MODAL */}
      

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