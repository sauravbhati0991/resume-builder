import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, TrendingUp, Users, Award, ShieldCheck, Database, CheckCircle2 
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
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all font-medium text-slate-700" 
    />
  </div>
);

export default function CustomerSuccessLeadTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Customer Success Lead",
    primaryColor: "#87CEEB", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Jessica",
      lastName: "Alba",
      title: "Customer Success Lead",
      email: "jessica.alba@success.com",
      phone: "+1 555 123 4567",
      location: "Austin, TX",
      summary: "Empathetic and data-driven Customer Success Lead with 7+ years of experience in B2B SaaS. Proven ability to reduce churn by 20%, drive product adoption, and lead high-performing support teams to exceed KPIs.",
      skills: "Churn Reduction, Account Management, Team Leadership, Zendesk, Salesforce, Onboarding, Conflict Resolution",
      experience: [
        { role: "Customer Success Lead", company: "CloudSphere", dates: "2020 - Present", description: "Manage a team of 12 CS managers. Designed a proactive outreach program that increased customer retention by 22% in the first year." },
        { role: "Senior CS Specialist", company: "DataFlow Tech", dates: "2016 - 2020", description: "Handled a portfolio of 50+ enterprise accounts. Conducted quarterly business reviews (QBRs) to ensure client goals were met." }
      ],
      education: "B.A. in Communications, University of Texas (2015)"
    }
  };

  // MASTER PATTERN STATE
  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false); // isDownloading state
   // showReplaceModal state
   // showSuccessModal state
   // generatedCvNumber state

  const handleInputChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleArrayChange = (index, arrayName, e) => {
    const { name, value } = e.target;
    const newArray = [...data[arrayName]];
    newArray[index][name] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  // Quick Draft Handshake
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
      {/* MASTER TOOLBAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-xl shadow-inner">
              <TrendingUp size={20} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight uppercase text-sm tracking-widest">Success Architect <span className="text-slate-300 ml-2 font-normal">| {templateConfig.name}</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
            Sync Draft
          </button>
          <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-[#87CEEB] text-slate-900 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-100 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            Finalize Portfolio
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* EDITOR SIDE */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Users size={16} className="text-sky-400"/> Identity & Base
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                    <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                    <InputGroup label="Leadership Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                    <InputGroup label="Professional Email" name="email" value={data.email} onChange={handleInputChange}/>
                    <InputGroup label="Direct Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                    <InputGroup label="Headquarters" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Summary</h3>
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none leading-relaxed text-slate-600 bg-slate-50/30"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Retention History</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-500 hover:text-sky-600 uppercase tracking-widest px-3 py-1 border border-sky-100 rounded-full">+ Add Position</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Company" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Tenure" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on Churn, NPS, and MRR growth..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 focus:ring-1 focus:ring-sky-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW SIDE */}
        <div className="w-1/2 bg-slate-200 rounded-3xl overflow-auto flex justify-center p-12 custom-scrollbar shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
                
                <div style={{ backgroundColor: templateConfig.primaryColor, color: '#0f172a', padding: '50px 60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: '1', marginBottom: '8px' }}>{data.firstName} {data.lastName}</h1>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>{data.title}</h2>
                        </div>
                        <Award size={48} className="opacity-20"/>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '25px', marginTop: '30px', fontSize: '11px', fontWeight: '800', color: '#0c4a6e', borderTop: '2px solid rgba(15,23,42,0.1)', paddingTop: '15px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} /> {data.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} /> {data.phone}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} /> {data.location}</span>
                    </div>
                </div>

                <div style={{ padding: '40px 60px', flex: 1, display: 'grid', gridTemplateColumns: '62% 33%', gap: '5%' }}>
                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '8px', marginBottom: '20px', letterSpacing: '1px' }}>Impact Summary</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#475569', fontWeight: '500' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '8px', marginBottom: '25px', letterSpacing: '1px' }}>Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '8px', marginBottom: '20px', letterSpacing: '1px' }}>Expertise</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '11px', backgroundColor: '#f8fafc', color: '#0f172a', padding: '10px 15px', borderRadius: '10px', fontWeight: '700', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={12} className="text-[#87CEEB]"/> {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '8px', marginBottom: '20px', letterSpacing: '1px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#475569', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                
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