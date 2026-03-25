import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, BookOpen, Award, ShieldCheck, Library
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-indigo-900/40 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border-b border-gray-200 bg-transparent px-0 py-1.5 text-sm focus:outline-none focus:border-[#312e81] transition-all font-serif" 
    />
  </div>
);

export default function PhDCandidateModernTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
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
  const [data, setData] = useState(templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [zoom, setZoom] = useState(0.75);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { 
    const newArray = [...data[arrayName]]; 
    newArray[index][field] = value; 
    setData(prev => ({ ...prev, [arrayName]: newArray })); 
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  const saveProgress = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`phd_draft_${data.lastName}`, JSON.stringify(data));
      setIsSaving(false);
    }, 800);
  };

  const runBuildProcess = async () => {
    try {
      setIsDownloading(true);
      // 1. Database Archiving
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Academic",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;
      setGeneratedCvNumber(cvNumber);

      // 2. PDF Rendering
      const opt = { 
        margin: 0, 
        filename: `CV_${data.lastName}_${cvNumber}.pdf`, 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 3, useCORS: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
      };

      const worker = html2pdf().set(opt).from(previewRef.current);
      const pdfBlob = await worker.output("blob");
      
      // 3. Asset Upload
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await worker.save();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Institutional Archiving Error:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
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
                <button onClick={saveProgress} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-2 transition-all">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} Draft
                </button>
                <button onClick={() => setShowReplaceModal(true)} disabled={isDownloading} className="px-6 py-2 text-sm font-bold text-white bg-[#312e81] rounded shadow-md hover:bg-[#252361] transition-all flex items-center gap-2">
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
                        <InputGroup label="Given Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Surname" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Candidacy Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Institutional Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Contact Number" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Current Base" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-4">Research Interests & Summary</h3>
                    <textarea rows={5} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-gray-100 rounded-lg p-4 text-sm focus:ring-1 focus:ring-[#312e81] outline-none bg-slate-50/50 leading-relaxed italic text-slate-600"/>
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
                                <InputGroup label="Role" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Institution" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Period" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border-b border-gray-100 p-2 text-sm focus:outline-none focus:border-[#312e81]"/>
                            </div>
                        </div>
                     ))}
                </section>

                <section>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-4">Methodologies & Education</h3>
                    <InputGroup label="Core Competencies" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Academic History" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
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
                {generatedCvNumber && (
                    <div style={{ position: 'absolute', bottom: '40px', left: '0', width: '100%', padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
                        <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ fontSize: '9px', padding: '0 15px', color: '#64748b', fontFamily: 'monospace' }}>CV-ID: {generatedCvNumber} // ACADEMIC_RECORD_LOCKED</div>
                        <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }}></div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded bg-white p-8 shadow-2xl border-t-4 border-[#312e81]">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Finalize Academic CV?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">This will archive your research profile and generate a permanent institutional reference ID for academic applications.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-5 py-2 text-slate-400 font-bold text-xs uppercase hover:bg-slate-50 transition-colors">Discard</button>
              <button onClick={runBuildProcess} disabled={isDownloading} className="px-6 py-2 bg-[#312e81] text-white font-bold shadow hover:bg-[#252361] text-xs uppercase tracking-widest transition-transform active:scale-95">
                {isDownloading ? "Archiving..." : "Commit Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded bg-white p-10 shadow-2xl text-center border-b-8 border-[#312e81]">
            <div className="w-20 h-20 bg-indigo-50 text-[#312e81] rounded-full flex items-center justify-center mx-auto mb-6">
              <Award size={48}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">PROFILE ARCHIVED</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Institutional reference number generated for your CV.</p>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-lg mb-8">
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Ref Number</p>
               <p className="text-3xl font-bold text-[#312e81] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#312e81] text-white font-bold uppercase tracking-widest shadow-xl hover:bg-[#1e1c50] transition-all">Return to Library</button>
          </div>
        </div>
      )}
    </div>
  );
}