import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Landmark, ShieldCheck, Briefcase, Award, Scale } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value} 
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] transition-all" />
  </div>
);

export default function PublicSectorDirectorEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Public Sector Director Elite",
    primaryColor: "#8B0000", 
    accentColor: "#D3D3D3",  
    defaultData: {
      firstName: "Jonathan",
      lastName: "Sterling",
      title: "Director of Public Works",
      email: "j.sterling@citygov.org",
      phone: "+1 555 999 8888",
      location: "Chicago, IL",
      summary: "Executive-level Public Sector Director with 15+ years of leadership in municipal government. Proven expertise in managing large-scale infrastructure projects, navigating complex regulatory environments, and ensuring absolute fiscal responsibility of multi-million dollar public funds.",
      skills: "Municipal Administration, Infrastructure Planning, Public Budgeting, Union Negotiations, Regulatory Compliance, Crisis Management",
      experience: [
        { role: "Director of Public Works", company: "City of Chicago", dates: "2016 - Present", description: "Manage a department of 300+ employees and an annual budget of $120M. Spearheaded the city's green infrastructure initiative, completing 5 major projects under budget." },
        { role: "City Manager", company: "Evanston Municipality", dates: "2008 - 2016", description: "Overhauled the municipal procurement process, saving taxpayers $2.5M annually. Served as the primary liaison between city council and public agencies." }
      ],
      education: "Master of Public Administration (MPA), Syracuse University (2008)\nB.A. Political Science (2005)"
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
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-black text-[#8B0000] tracking-widest uppercase text-xs">Executive Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-6 rounded-md text-white shadow-lg hover:brightness-110 transition-all font-bold" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Export Elite CV</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-24 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] tracking-tighter uppercase"><Landmark size={20}/> Director Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Current Command/Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Direct Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="HQ Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] uppercase tracking-tighter"><Award size={20}/> Executive Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none bg-gray-50/50 leading-relaxed font-serif italic"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-black text-[#8B0000] uppercase tracking-tighter">
                        <h3 className="flex items-center gap-2"><Briefcase size={20}/> Service Record</h3>
                        <button onClick={addExperience} className="text-[10px] bg-[#8B0000] text-white px-3 py-1.5 rounded shadow-md hover:opacity-80 transition-opacity">Add Mandate</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-5 border-2 rounded-xl bg-gray-50/30 relative group border-gray-100">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Agency/Municipality" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates of Service" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000] uppercase tracking-tighter"><Scale size={20}/> Competencies & Pedigree</h3>
                    <InputGroup label="Core Skills (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education & Credentials" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar shadow-inner">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: '"Georgia", serif' }}>
                    <div style={{ textAlign: 'center', padding: '50px 50px 20px', borderBottom: `3px double ${templateConfig.primaryColor}`, margin: '0 40px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            {data.firstName} <span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                        </h1>
                        <p style={{ fontSize: '15px', color: '#333', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>{data.title}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: '#555', backgroundColor: templateConfig.accentColor, padding: '8px', borderRadius: '2px' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>
                    <div style={{ padding: '30px 60px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Executive Summary</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#111', textAlign: 'justify' }}>{data.summary}</p>
                        </section>
                        <section style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '20px', letterSpacing: '1px' }}>Public Service History</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '600', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#222', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Competencies</h3>
                                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: '#111', lineHeight: '1.7' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                                </ul>
                            </section>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px', letterSpacing: '1px' }}>Education</h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#111', textAlign: 'center', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </section>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
      </div>

      

      

    </div>
  );
}