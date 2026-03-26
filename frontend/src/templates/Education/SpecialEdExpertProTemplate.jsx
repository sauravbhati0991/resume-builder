import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
    />
  </div>
);

export default function SpecialEdExpertProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  const previewRef = useRef();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  
  const templateConfig = {
    name: "Special Ed Expert Pro",
    primaryColor: "#FF8C00", // Dark Orange
    accentColor: "#000080",  // Navy Blue
    defaultData: {
      firstName: "Sarah",
      lastName: "Martinez",
      title: "Special Education Coordinator",
      email: "s.martinez@speded.org",
      phone: "+1 (555) 246-8101",
      location: "Denver, CO",
      summary: "Compassionate Special Education Expert with 12 years of experience advocating for students with diverse learning needs. Skilled in developing customized IEPs, managing behavioral interventions, and collaborating with parents and interdisciplinary teams.",
      skills: "IEP Development, Applied Behavior Analysis (ABA), Autism Spectrum Support, Progress Monitoring, Inclusive Co-Teaching, Parent Advocacy",
      experience: [
        { role: "Special Education Coordinator", company: "Denver Public Schools", dates: "2017 - Present", description: "Manage a caseload of 40+ students with varying disabilities. Lead annual IEP meetings and train general education teachers on inclusion strategies." },
        { role: "Special Needs Teacher", company: "Oakridge Elementary", dates: "2012 - 2017", description: "Provided resource room and push-in support for K-5 students. Implemented positive behavioral support systems (PBIS)." }
      ],
      education: "M.A. Special Education, University of Denver (2012)\nB.S. Early Childhood Education (2010)"
    }
  };

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
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save</button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}><Download className="w-4 h-4 mr-2" /> Export PDF</button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Personal Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Institution" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Skills & Education</h3>
                    <InputGroup label="Expertise (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
                    
                    {/* Navy Blue Sidebar */}
                    <div style={{ width: '32%', backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 25px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: templateConfig.primaryColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
                            {data.firstName[0]}{data.lastName[0]}
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Contact</h3>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14}/> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14}/> {data.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14}/> {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Expertise</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '12px', padding: '6px 10px', backgroundColor: 'rgba(255, 140, 0, 0.1)', borderLeft: `3px solid ${templateConfig.primaryColor}` }}>
                                        {skill.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                        </div>
                    </div>

                    {/* White Main Area */}
                    <div style={{ width: '68%', padding: '40px 35px' }}>
                        <div style={{ marginBottom: '30px', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '20px' }}>
                            <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#111', textTransform: 'uppercase', marginBottom: '5px', margin: 0 }}>{data.firstName} {data.lastName}</h1>
                            <h2 style={{ fontSize: '16px', color: templateConfig.primaryColor, fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>{data.title}</h2>
                        </div>

                        <section style={{ marginBottom: '35px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '10px' }}>About Me</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '20px' }}>Experience</h3>
                            <div style={{ position: 'relative', borderLeft: `2px solid ${templateConfig.primaryColor}`, paddingLeft: '20px', marginLeft: '5px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '25px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', width: '12px', height: '12px', backgroundColor: templateConfig.primaryColor, borderRadius: '50%', left: '-27px', top: '3px' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#222', margin: 0 }}>{exp.role}</h4>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.accentColor }}>{exp.dates}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>{exp.company}</div>
                                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      

      

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