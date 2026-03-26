import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, ChefHat, Award, BookOpen } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value} 
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A460]" />
  </div>
);

export default function ExecutiveChefEliteTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Executive Chef Elite",
    primaryColor: "#F4A460", 
    accentColor: "#4682B4",  
    defaultData: {
      firstName: "Gordon",
      lastName: "Ramsay",
      title: "Executive Chef",
      email: "chef.gordon@kitchen.com",
      phone: "+1 555 999 1111",
      location: "Las Vegas, NV",
      summary: "Award-winning Executive Chef with 15 years of culinary leadership in Michelin-starred and high-volume resort kitchens. Expert in menu engineering, food cost control, and mentoring back-of-house teams to deliver flawless dining experiences.",
      skills: "Menu Development, Food Cost Control, Vendor Sourcing, Kitchen Safety & Sanitation, Fine Dining, Team Leadership, Inventory Management",
      experience: [
        { role: "Executive Chef", company: "The Venetian Resort", dates: "2017 - Present", description: "Direct culinary operations for 4 distinct on-site restaurants. Redesigned menus to reduce food waste by 18% while increasing overall revenue by $1.2M." },
        { role: "Sous Chef", company: "Bistro Luxe", dates: "2010 - 2017", description: "Assisted in managing a brigade of 30 chefs. Spearheaded the weekend tasting menu, which became a signature offering." }
      ],
      education: "A.S. Culinary Arts, Culinary Institute of America (2010)"
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
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.accentColor }}>
                   {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ChefHat size={20} className="text-[#F4A460]"/> Personal Info</h3>
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
                    <h3 className="text-lg font-bold mb-4">Chef's Statement</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-[#F4A460]"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Culinary Experience</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold">+ Add Stage</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Establishment" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#F4A460]"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-[#F4A460]"/> Expertise & Education</h3>
                    <InputGroup label="Technical Skills" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education/Certifications" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ padding: '40px 50px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                            <h2 style={{ fontSize: '18px', color: templateConfig.accentColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</h2>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: templateConfig.primaryColor, padding: '15px 50px', color: 'white', fontSize: '13px', lineHeight: '1.6' }}>
                        {data.summary}
                    </div>

                    <div style={{ padding: '40px 50px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <section>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid #eee`, paddingBottom: '8px', marginBottom: '20px' }}>Culinary Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.company}</span>
                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>{exp.dates}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        <div>
                            <section style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid #eee`, paddingBottom: '8px', marginBottom: '20px' }}>Kitchen Skills</h3>
                                <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.8' }}>
                                    {data.skills.split(',').map((s, i) => <li key={i}>{s.trim()}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid #eee`, paddingBottom: '8px', marginBottom: '20px' }}>Training</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
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