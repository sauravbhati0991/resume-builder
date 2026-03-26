import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Headphones, BarChart3, CheckCircle2, UserCheck, Database, ShieldCheck 
} from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all" 
    />
  </div>
);

export default function CallCenterLeadProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Call Center Lead Pro",
    primaryColor: "#87CEEB", 
    accentColor: "#f0f9ff",  
    defaultData: {
      firstName: "Patricia",
      lastName: "Reyes",
      title: "Call Center Supervisor",
      email: "p.reyes@callcenter.com",
      phone: "+1 555 456 7890",
      location: "Phoenix, AZ",
      summary: "Performance-oriented Call Center Supervisor with 6 years of experience managing inbound/outbound support teams. Expert in tracking call metrics (AHT, FCR, CSAT) and coaching agents to deliver outstanding service in high-volume environments.",
      skills: "Workforce Management, QA Coaching, CRM (Salesforce), Conflict Resolution, Call Metrics Analytics, Typing (90 WPM)",
      experience: [
        { role: "Call Center Supervisor", company: "TeleSolutions Inc.", dates: "2019 - Present", description: "Manage a shift of 40 agents. Reduced average handle time (AHT) by 15% through targeted training modules. Maintained a 95% First Call Resolution rate." },
        { role: "Tier 2 Support Agent", company: "Global Connect", dates: "2016 - 2019", description: "Handled escalated customer complaints. Mentored new hires during the 2-week onboarding process." }
      ],
      education: "B.A. Business Administration, Arizona State (2016)"
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
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-800 z-[60]">
      {/* MASTER TOOLBAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-lg shadow-sm">
              <Headphones size={20} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight uppercase text-sm tracking-widest">{templateConfig.name} Builder</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} 
            Sync Draft
          </button>
          <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-[#87CEEB] text-slate-900 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            Finalize Profile
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-6">
        {/* INPUT PANEL */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <UserCheck size={16}/> Supervisor Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                    <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                    <InputGroup label="Official Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                    <InputGroup label="Primary Email" name="email" value={data.email} onChange={handleInputChange}/>
                    <InputGroup label="Phone Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                    <InputGroup label="Office Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-4">
                  <BarChart3 size={16}/> Operational Value Prop
                </h3>
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none leading-relaxed text-slate-600"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Call Center Tenure</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest">+ Add Record</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="BPO / Company" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                            <textarea rows={3} placeholder="Focus on metrics: AHT, FCR, CSAT improvements..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded-lg p-3 text-sm text-slate-600"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-1/2 bg-slate-200 rounded-2xl overflow-auto flex justify-center p-12 custom-scrollbar shadow-inner">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                
                <div style={{ backgroundColor: templateConfig.primaryColor, color: '#111', padding: '45px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '-1px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#0c4a6e' }}>{data.title}</h2>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: '600', lineHeight: '1.7', color: '#0c4a6e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Mail size={10}/> {data.email}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Phone size={10}/> {data.phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><MapPin size={10}/> {data.location}</div>
                    </div>
                </div>

                <div style={{ padding: '40px 50px', flex: 1, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '50px' }}>
                    <div>
                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '15px', letterSpacing: '1px' }}>Operational Summary</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#334155' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Management Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{exp.role}</h4>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '700', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Performance Stack</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: templateConfig.accentColor, color: '#0c4a6e', padding: '10px 14px', borderRadius: '8px', fontWeight: '700', border: '1px solid #e0f2fe' }}>
                                        <CheckCircle2 size={12} className="text-[#87CEEB]"/> {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0c4a6e', textTransform: 'uppercase', borderBottom: `3px solid ${templateConfig.primaryColor}`, paddingBottom: '6px', marginBottom: '20px', letterSpacing: '1px' }}>Credentials</h3>
                            <p style={{ fontSize: '11px', lineHeight: '1.7', color: '#475569', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
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