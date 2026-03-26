import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Download, Plus, Trash2, Loader2, 
  Cpu, Terminal, Activity, ShieldCheck, LifeBuoy, Monitor,
  Database, CheckCircle2
} from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
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

export default function SupportSpecialistModernTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Support Specialist Modern",
    primaryColor: "#87CEEB", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "David",
      lastName: "Kim",
      title: "IT Support Specialist",
      email: "david.kim@support.com",
      phone: "+1 555 999 8888",
      location: "Denver, CO",
      summary: "Patient and highly technical Support Specialist with a talent for translating complex IT issues into simple terms for end-users. Resolves 90% of Tier 1 & 2 tickets on the first call.",
      skills: "Active Directory, Office 365 Admin, Ticketing Systems (Jira), Hardware Troubleshooting, Remote Desktop, Empathy",
      experience: [
        { role: "IT Support Specialist", company: "TechAssist Pro", dates: "2019 - Present", description: "Provide remote technical support to 1,000+ corporate users. Managed software deployments and configured laptops for new hires." },
        { role: "Help Desk Technician", company: "Retail Corp", dates: "2015 - 2019", description: "Logged and resolved hardware failures and network connectivity issues for 50 retail locations." }
      ],
      education: "A.S. Information Technology, Denver College (2015)\nCompTIA A+ Certified"
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

  // STORAGE HANDSHAKE
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
      {/* SUPPORT HEADER */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-lg">
              <LifeBuoy size={20} className="text-slate-900"/>
            </div>
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-[0.2em]">Support Architect <span className="font-normal text-slate-400 ml-2">v3.0</span></h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} 
            Sync Local
          </button>
          <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />} 
            Deploy Profile
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden flex gap-8">
        {/* TECH EDITOR */}
        <div className="w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                   <Monitor size={16} className="text-[#87CEEB]"/> Station Identity
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                    <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                    <InputGroup label="Technical Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                    <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                    <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                    <InputGroup label="Base Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Objective</h3>
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#87CEEB] outline-none text-slate-600 bg-slate-50/50 font-mono shadow-inner"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident History</h3>
                    <button onClick={addExperience} className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.1em] border border-sky-100 px-3 py-1 rounded-md">ADD LOG ENTRY</button>
                 </div>
                 {data.experience.map((exp, i) => (
                    <div key={i} className="mb-6 p-5 border border-slate-100 rounded-xl bg-slate-50/30 relative group transition-all hover:shadow-md">
                        <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                            <InputGroup label="Uptime" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                            <textarea rows={3} placeholder="Key deliverables, SLA metrics, or hardware managed..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 focus:ring-1 focus:ring-sky-200 outline-none"/>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* MODERN PREVIEW */}
        <div className="w-1/2 bg-slate-200 flex justify-center overflow-y-auto p-12 custom-scrollbar shadow-inner rounded-3xl">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                {/* Tech Sidebar */}
                <div style={{ width: '35%', backgroundColor: '#0f172a', color: 'white', padding: '50px 30px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '50px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase', color: templateConfig.primaryColor }}>{data.firstName}<br/>{data.lastName}</h1>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '15px', color: '#94a3b8' }}>{data.title}</p>
                    </div>

                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Communications</h3>
                        <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={12} className="text-[#87CEEB]"/> {data.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Terminal size={12} className="text-[#87CEEB]"/> {data.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={12} className="text-[#87CEEB]"/> {data.location}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Tech Stack</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {data.skills.split(',').map((skill, i) => (
                                <div key={i} style={{ fontSize: '10px', backgroundColor: 'rgba(135,206,235,0.1)', color: '#87CEEB', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(135,206,235,0.2)' }}>{skill.trim()}</div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '20px', letterSpacing: '1px' }}>Credentials</h3>
                        <p style={{ fontSize: '11px', lineHeight: '1.7', whiteSpace: 'pre-line', color: '#cbd5e1' }}>{data.education}</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ width: '65%', padding: '50px 50px', backgroundColor: 'white' }}>
                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <ShieldCheck size={18} className="text-[#87CEEB]"/> Executive Profile
                        </h3>
                        <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#475569', fontStyle: 'italic' }}>"{data.summary}"</p>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <Activity size={18} className="text-[#87CEEB]"/> Professional Uptime
                        </h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '35px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #f1f5f9' }}>
                                <div style={{ position: 'absolute', left: '-2px', top: '0', width: '2px', height: '15px', backgroundColor: templateConfig.primaryColor }}></div>
                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '800', textTransform: 'uppercase' }}>{exp.company}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>{exp.dates}</span>
                                </div>
                                <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>

                {/* TECH FOOTER */}
                
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