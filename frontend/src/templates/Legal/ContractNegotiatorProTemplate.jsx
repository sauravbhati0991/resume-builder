import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Scale, Briefcase, FileCheck, Award,
  Database, CheckCircle2, ShieldAlert
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
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00008B] transition-all shadow-sm font-medium text-slate-700" 
    />
  </div>
);

export default function ContractNegotiatorProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Contract Negotiator Pro",
    primaryColor: "#00008B", 
    accentColor: "#F5F5DC",  
    defaultData: {
      firstName: "Michael",
      lastName: "Ross",
      title: "Senior Contract Negotiator",
      email: "m.ross@legal.com",
      phone: "+1 555 101 2020",
      location: "New York, NY",
      summary: "Detail-oriented Contract Negotiator with 8 years of experience drafting, reviewing, and executing high-value commercial agreements. Proven track record of protecting corporate interests, reducing legal exposure by 30%, and expediting the deal cycle for Fortune 500 tech clients.",
      skills: "Commercial Contracts (MSA, NDA, SOW), Deal Structuring, Risk Mitigation, Vendor Negotiation, IP Licensing, Regulatory Compliance",
      experience: [
        { role: "Lead Contract Negotiator", company: "Global Tech Solutions", dates: "2019 - Present", description: "Negotiate and close 50+ enterprise SaaS agreements annually. Standardized the MSA template process, reducing contract turnaround time by 15 days." },
        { role: "Contracts Administrator", company: "Finance Partners LLC", dates: "2015 - 2019", description: "Reviewed vendor agreements for compliance with internal risk policies. Facilitated communication between legal, sales, and procurement teams." }
      ],
      education: "J.D., Columbia Law School (2015)\nB.A. Pre-Law, NYU (2012)"
    }
  };

  // MASTER PATTERN STATE
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

  // STORAGE SYNC HANDSHAKE
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
      {/* PROFESSIONAL HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#00008B] p-2 rounded shadow-md">
              <Scale size={20} className="text-[#F5F5DC]"/>
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight uppercase text-xs tracking-[0.2em]">{templateConfig.name} <span className="text-slate-400 font-medium ml-1">v4.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={syncContractState} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Local Sync
          </button>
          <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-[#00008B] text-white px-6 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
            Execute Archive
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* CONTRACT EDITOR */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Briefcase size={16} className="text-blue-900"/> Professional Profile
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                    <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                    <InputGroup label="Professional Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                    <InputGroup label="Business Email" name="email" value={data.email} onChange={handleInputChange}/>
                    <InputGroup label="Contact Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                    <InputGroup label="Office Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-1 focus:ring-[#00008B] outline-none text-slate-600 bg-slate-50/30 font-serif italic shadow-inner"/>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Deal Experience</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-blue-800 hover:underline tracking-widest uppercase">+ ADD CLAUSE</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded bg-slate-50/50 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Position" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Firm/Corp" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Term" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                            <textarea rows={3} placeholder="Key deal terms, negotiation wins, or contract types..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded p-3 text-sm text-slate-600 focus:ring-1 focus:ring-blue-100 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW */}
        <div className="w-1/2 bg-slate-300 flex justify-center overflow-y-auto p-12 custom-scrollbar rounded-3xl shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', fontFamily: '"Times New Roman", Times, serif' }}>
                
                {/* Header Block */}
                <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '50px 60px', borderBottom: `8px solid ${templateConfig.accentColor}` }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0' }}>{data.firstName} {data.lastName}</h1>
                    <h2 style={{ fontSize: '18px', color: templateConfig.accentColor, fontWeight: 'normal', letterSpacing: '2px', margin: 0, opacity: 0.9 }}>{data.title}</h2>
                    
                    <div style={{ display: 'flex', gap: '25px', marginTop: '30px', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} color={templateConfig.accentColor}/> {data.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} color={templateConfig.accentColor}/> {data.phone}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} color={templateConfig.accentColor}/> {data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Award size={16}/> Professional Statement
                        </h3>
                        <p style={{ fontSize: '13.5px', lineHeight: '1.7', color: '#111', textAlign: 'justify' }}>{data.summary}</p>
                    </section>

                    <section style={{ marginBottom: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileCheck size={16}/> Transactional History
                        </h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.role}</h4>
                                    <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#666', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#222', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <section>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px' }}>Specialized Skills</h3>
                            <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '13px', color: '#111', lineHeight: '1.8' }}>
                                {data.skills.split(',').map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s.trim()}</li>)}
                            </ul>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `1.5px solid #eee`, paddingBottom: '6px', marginBottom: '15px' }}>Academic Background</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#111', whiteSpace: 'pre-line', fontWeight: 'bold' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {/* AUTHENTICITY FOOTER */}
                
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