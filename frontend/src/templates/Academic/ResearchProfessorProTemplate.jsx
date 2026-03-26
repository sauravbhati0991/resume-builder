import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Landmark, Book, ShieldCheck, GraduationCap 
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
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81] transition-all font-serif" 
    />
  </div>
);

export default function ResearchProfessorProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Research Professor Pro",
    primaryColor: "#312e81", 
    accentColor: "#eef2ff",  
    defaultData: {
      firstName: "Prof. Henry",
      lastName: "Adams",
      title: "Tenured Professor of Economics",
      email: "h.adams@university.edu",
      phone: "+1 555 888 9999",
      location: "New Haven, CT",
      summary: "Tenured Professor of Economics specializing in macro-economic theory and international trade. Author of 3 textbooks and over 40 peer-reviewed articles. Passionate educator dedicated to advancing graduate student research and securing institutional funding.",
      skills: "Macroeconomics, Econometrics, Stata, Academic Publishing, Curriculum Design, Grant Acquisition, Peer Review",
      experience: [
        { role: "Professor of Economics", company: "Yale University", dates: "2015 - Present", description: "Teach advanced graduate seminars in Econometrics. Serve on the university tenure review board. Secured a $500k grant from the NSF for international trade research." },
        { role: "Associate Professor", company: "Columbia University", dates: "2008 - 2015", description: "Published the highly cited textbook 'Modern Macroeconomic Theory'. Advised 12 Ph.D. candidates to successful dissertation defense." }
      ],
      education: "Ph.D. Economics, University of Chicago (2008)\nB.A. Mathematics, Princeton (2002)"
    }
  };

  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
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
    <div className="min-h-screen w-full bg-[#f1f5f9] flex flex-col overflow-hidden">
      
      {/* PROFESSIONAL TOP BAR */}
      <div className="w-full px-8 py-4 shrink-0 bg-white border-b border-slate-200 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/templates')} className="text-slate-400 hover:text-[#312e81] transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex items-center gap-3">
                    <Landmark className="text-[#312e81]" size={24}/>
                    <span className="font-serif text-xl font-bold text-slate-800 tracking-tight">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={saveToDrafts} disabled={isSaving} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-all">
                    {isSaving ? "Saving..." : "Save Draft"}
                </button>
                <button onClick={() => setShowConfirmModal(true)} disabled={isDownloading} className="px-6 py-2 text-sm font-bold text-white bg-[#312e81] rounded-md shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2">
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <><Download size={16} /> Archive & Download</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* INPUT COLUMN */}
        <div className="w-1/2 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
            <div className="max-w-xl mx-auto space-y-8 pb-32">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Academic Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Official Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone Number" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Institution Base" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Executive Summary</h3>
                    <textarea rows={6} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-slate-100 rounded-lg p-4 text-sm focus:ring-1 focus:ring-[#312e81] outline-none bg-slate-50 font-serif leading-relaxed text-slate-700 italic"/>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Appointments</h3>
                        <button onClick={addExperience} className="text-[10px] font-bold bg-slate-800 text-white px-4 py-2 rounded uppercase tracking-widest hover:bg-[#312e81] transition-colors">+ New Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-8 p-6 border border-slate-100 rounded-lg relative group bg-slate-50/30">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="Academic Rank" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Institution" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates of Tenure" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={4} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-slate-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#312e81] font-serif"/>
                            </div>
                        </div>
                     ))}
                </div>
            </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="w-1/2 bg-slate-800 flex justify-center overflow-y-auto p-12 custom-scrollbar">
            <div 
                ref={previewRef} 
                style={{ 
                    width: '210mm', 
                    minHeight: '297mm', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative', 
                    fontFamily: '"Georgia", serif',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header with Professional Border */}
                <div style={{ padding: '60px 60px 30px', textAlign: 'center' }}>
                    <div style={{ borderTop: `4px solid ${templateConfig.primaryColor}`, borderBottom: `1px solid ${templateConfig.primaryColor}`, padding: '30px 0' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
                            {data.firstName} {data.lastName}
                        </h1>
                        <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{data.title}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '12px', color: '#444', fontStyle: 'italic' }}>
                            <span className="flex items-center gap-1"><Mail size={12}/> {data.email}</span>
                            <span className="flex items-center gap-1"><Phone size={12}/> {data.phone}</span>
                            <span className="flex items-center gap-1"><MapPin size={12}/> {data.location}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px 70px 60px', flex: 1 }}>
                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Academic Profile</h3>
                        <p style={{ fontSize: '13px', lineHeight: '1.9', color: '#2d3748', textAlign: 'justify' }}>{data.summary}</p>
                    </section>

                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', letterSpacing: '1px' }}>Institutional Appointments</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.company}</h4>
                                    <span style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>{exp.dates}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.role}</div>
                                <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#4a5568', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <section>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Research Areas</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <span key={i} style={{ fontSize: '11px', color: '#2d3748', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', padding: '4px 8px', borderRadius: '4px' }}>{skill.trim()}</span>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Academic Background</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#2d3748', whiteSpace: 'pre-line', fontStyle: 'italic' }}>{data.education}</p>
                        </section>
                    </div>
                </div>

                {/* INSTITUTIONAL VERIFICATION FOOTER */}
                
            </div>
        </div>
      </div>

      {/* ARCHIVE CONFIRMATION */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl border-t-8 border-[#312e81]">
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Commit to Archive?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed italic">By proceeding, this CV will be assigned a permanent Institutional Archive ID for career-long verification and record-keeping.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-slate-400 text-xs font-bold uppercase hover:bg-slate-50">Cancel</button>
              <button onClick={runInstitutionalSync} className="px-6 py-2 bg-[#312e81] text-white text-xs font-bold uppercase rounded shadow-lg">Proceed to Sync</button>
            </div>
          </div>
        </div>
      )}

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