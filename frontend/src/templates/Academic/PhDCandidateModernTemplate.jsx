import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, BookOpen, Award, ShieldCheck, Library
} from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-indigo-900/40 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded border-b border-gray-200 bg-transparent px-0 py-1.5 text-sm focus:outline-none focus:border-[#312e81] transition-all font-serif" 
    />
  </div>
);

export default function PhDCandidateModernTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "PhD Candidate Modern",
    primaryColor: "#312e81", 
    accentColor: "#eef2ff",  
    defaultData: {
      firstName: "Sarah",
      lastName: "Lin",
      title: "Ph.D. Candidate in Sociology",
      email: "sarah.lin@university.edu",
      phone: "+1 555 789 1234",
      location: "Berkeley, CA",
      summary: "Dedicated Ph.D. Candidate specializing in urban sociology and public policy. Experienced in qualitative research methods, teaching undergraduate seminars, and writing grant proposals. Dissertation focused on housing inequality in metropolitan areas.",
      skills: "Qualitative Research, NVivo, Data Analysis, Academic Writing, Teaching & Lecturing, Grant Writing, Survey Design",
      experience: [
        { role: "Graduate Teaching Assistant", company: "UC Berkeley", dates: "2021 - Present", description: "Lead weekly seminar sections for 'Intro to Sociology' (100+ students). Grade essays and hold office hours. Awarded 'Outstanding Graduate Instructor' in 2022." },
        { role: "Research Assistant", company: "Urban Housing Institute", dates: "2019 - 2021", description: "Conducted 50+ in-depth interviews for a study on gentrification. Transcribed and coded qualitative data using NVivo." }
      ],
      education: "Ph.D. Sociology, UC Berkeley (Expected 2025)\nM.A. Sociology (2021)\nB.A. Public Policy (2019)"
    }
  };

  // Logic State
  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
        const [zoom, setZoom] = useState(0.75);

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
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-serif">
      
      {/* NAVIGATION TOOLBAR */}
      <div className="w-full px-6 py-4 shrink-0 bg-white border-b border-gray-200 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="hover:text-indigo-900 transition-colors"><ArrowLeft size={20} /></button>
                <div className="flex items-center gap-2">
                    <Library className="text-[#312e81]" size={22}/>
                    <span className="font-bold text-slate-800 tracking-tight text-lg">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-2 transition-all">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="px-6 py-2 text-sm font-bold text-white bg-[#312e81] rounded shadow-md hover:bg-[#252361] transition-all flex items-center gap-2">
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Finalize CV
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* EDITOR PANEL */}
        <div className="w-1/2 overflow-y-auto p-8 custom-scrollbar bg-white border-r border-gray-100">
            <div className="max-w-xl mx-auto space-y-10 pb-24">
                <section>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <BookOpen size={14}/> Biographical Data
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InputGroup label="Given Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Surname" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Candidacy Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Institutional Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Current Base" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-4">Research Interests & Summary</h3>
                    <textarea rows={5} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-gray-100 rounded-lg p-4 text-sm focus:ring-1 focus:ring-[#312e81] outline-none bg-slate-50/50 leading-relaxed italic text-slate-600"/>
                </section>

                <section>
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em]">Academic Appointments</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold border border-indigo-900 text-indigo-900 px-3 py-1 hover:bg-indigo-50 transition-colors uppercase tracking-widest">+ Add Record</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-8 p-6 border-l-2 border-indigo-100 bg-white relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-0 right-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Institution" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Period" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border-b border-gray-100 p-2 text-sm focus:outline-none focus:border-[#312e81]"/>
                            </div>
                        </div>
                     ))}
                </section>

                <section>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-4">Methodologies & Education</h3>
                    <InputGroup label="Core Competencies" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic History" name="education" value={data.education} onChange={handleInputChange}/>
                </section>
            </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="w-1/2 bg-slate-100 overflow-y-auto p-12 custom-scrollbar flex justify-center items-start">
            <div 
                ref={previewRef} 
                style={{ 
                    width: '210mm', 
                    minHeight: '297mm', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    position: 'relative',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
                }}
            >
                {/* Left Sidebar (Methodology & Background) */}
                <div style={{ width: '32%', backgroundColor: templateConfig.accentColor, padding: '50px 30px', borderRight: '1px solid #d1d5db' }}>
                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '20px', letterSpacing: '2px' }}>Contact Info</h3>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#4b5563', lineHeight: '1.5' }}>
                            <div className="flex items-center gap-2"><Phone size={12}/> {data.phone}</div>
                            <div className="flex items-center gap-2 underline"><Mail size={12}/> {data.email}</div>
                            <div className="flex items-center gap-2"><MapPin size={12}/> {data.location}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '20px', letterSpacing: '2px' }}>Methodology</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {data.skills.split(',').map((skill, i) => (
                                <div key={i} style={{ fontSize: '11.5px', color: '#374151', fontWeight: '500', display: 'flex', gap: '8px' }}>
                                    <span style={{ color: templateConfig.primaryColor }}>•</span> {skill.trim()}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: templateConfig.primaryColor, marginBottom: '20px', letterSpacing: '2px' }}>Education</h3>
                        <p style={{ fontSize: '11.5px', lineHeight: '1.8', whiteSpace: 'pre-line', color: '#374151', fontWeight: '500' }}>{data.education}</p>
                    </div>
                </div>

                {/* Right Content (Main Body) */}
                <div style={{ width: '68%', padding: '50px 45px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', lineHeight: '1', margin: '0 0 8px 0', letterSpacing: '-1px' }}>{data.firstName}<br/>{data.lastName}</h1>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</p>
                    </div>

                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Research Narrative
                        </h3>
                        <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#4b5563', textAlign: 'justify' }}>{data.summary}</p>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Appointments & Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>{exp.role}</h4>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: '700', marginBottom: '10px' }}>{exp.company}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Academic Verification Bar */}
                
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