import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Microscope, Beaker, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value} 
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]" />
  </div>
);

export default function LabManagerModernTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Lab Manager Modern",
    primaryColor: "#008080", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Valerie",
      lastName: "Frizzle",
      title: "Laboratory Operations Manager",
      email: "v.frizzle@researchlab.org",
      phone: "+1 555 404 0000",
      location: "Boston, MA",
      summary: "Detail-oriented Lab Manager with 8 years of experience overseeing BSL-2 and BSL-3 facilities. Proven expertise in equipment maintenance, reagent procurement, and ensuring strict compliance with OSHA and EPA regulations. Dedicated to maximizing operational efficiency so scientists can focus on discovery.",
      skills: "Lab Safety & Compliance, BSL-2/BSL-3 Operations, Inventory Management, Equipment Calibration, LIMS Software, Budgeting, SOP Development",
      experience: [
        { role: "Senior Lab Manager", company: "GenoTech Research Institute", dates: "2018 - Present", description: "Manage a $2M annual operating budget. Oversee inventory and procurement for 45 research scientists. Successfully passed 3 consecutive state safety audits with zero infractions." },
        { role: "Lab Technician / Safety Officer", company: "BioHealth Labs", dates: "2013 - 2018", description: "Calibrated and maintained centrifuges, mass spectrometers, and PCR machines. Wrote and updated standard operating procedures (SOPs) for hazardous waste disposal." }
      ],
      education: "B.S. Biochemistry, Boston University (2013)\nCertified Chemical Hygiene Officer (CCHO)"
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
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-bold text-[#008080] tracking-tight">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</> : <><Download className="w-4 h-4 mr-2" /> Generate PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Beaker size={20} className="text-[#008080]"/> Lab Personnel Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Managerial Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Executive Abstract</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-[#008080] bg-gray-50/50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-bold">
                        <h3>Operational History</h3>
                        <button onClick={addExperience} className="text-xs bg-[#008080] text-white px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity">+ Add Position</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50/30 relative group border-dashed border-gray-300">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#008080]"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[#008080]"/> Compliance & Education</h3>
                    <InputGroup label="Lab Skills (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Certifications & Education" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
                    <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: templateConfig.accentColor, padding: '40px 30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ borderBottom: `2px solid rgba(255,255,255,0.2)`, paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>{data.firstName}<br/>{data.lastName}</h1>
                            <p style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{data.title}</p>
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Contact</h3>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>{data.phone}</div>
                                <div>{data.email}</div>
                                <div>{data.location}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Lab Skills</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.skills.split(',').map((skill, i) => (
                                    <div key={i} style={{ fontSize: '12px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{skill.trim()}</div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '5px', marginBottom: '15px' }}>Education</h3>
                            <p style={{ fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{data.education}</p>
                        </div>
                    </div>
                    <div style={{ width: '65%', padding: '40px 45px' }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.primaryColor }}></div> Profile
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                        </section>
                        <section>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.primaryColor }}></div> Professional History
                            </h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>{exp.company}</span>
                                        <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>

                    
                </div>
            </div>
        </div>
      </div>

      

      

    </div>
  );
}