import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Beaker, Database, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value} 
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]" />
  </div>
);

export default function BiotechAnalystProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Biotech Analyst Pro",
    primaryColor: "#008080", 
    accentColor: "#FFFFFF",  
    defaultData: {
      firstName: "Elias",
      lastName: "Vance",
      title: "Senior Bioinformatics Analyst",
      email: "e.vance@biotech.com",
      phone: "+1 555 111 2222",
      location: "San Francisco, CA",
      summary: "Analytical Bioinformatics specialist focused on genomic data interpretation and predictive modeling. Adept at translating massive biological datasets into actionable pharmacological targets using Python, R, and advanced machine learning algorithms.",
      skills: "Python, R, Next-Generation Sequencing (NGS), Statistical Modeling, Data Visualization (Tableau), Machine Learning, Molecular Biology",
      experience: [
        { role: "Bioinformatics Analyst", company: "GenePharma Inc.", dates: "2019 - Present", description: "Developed custom Python pipelines to process NGS data, reducing analysis time by 40%. Collaborated with wet-lab scientists to identify 3 novel drug targets for oncology." },
        { role: "Data Analyst", company: "University Genomics Center", dates: "2016 - 2019", description: "Maintained and queried massive PostgreSQL genomic databases. Authored data reports for NIH grant proposals." }
      ],
      education: "M.S. Bioinformatics, Stanford University (2016)\nB.S. Computational Biology (2014)"
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
                <span className="font-bold text-[#008080]">{templateConfig.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
                   {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Export PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#008080]"><Beaker size={20}/> Researcher Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Scientific Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Base Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Scientific Abstract</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-[#008080] outline-none bg-gray-50/50"/>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                     <div className="flex justify-between mb-4 items-center font-bold text-[#008080]">
                        <h3>Clinical & Research History</h3>
                        <button onClick={addExperience} className="text-xs bg-[#008080] text-white px-3 py-1 rounded hover:opacity-80 transition-opacity">+ Add Position</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group border-dashed border-gray-300">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Duration" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#008080] outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#008080]"><Database size={20}/> Technical Stack & Education</h3>
                    <InputGroup label="Analysis Tools (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Academic Credentials" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ height: '8px', backgroundColor: templateConfig.primaryColor, width: '100%' }}></div>

                    <div style={{ padding: '40px 50px 20px', borderBottom: '1px solid #E5E7EB' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                        <h2 style={{ fontSize: '15px', color: '#555', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                        <div style={{ display: 'flex', gap: '25px', marginTop: '15px', fontSize: '11px', color: '#666', fontWeight: '600' }}>
                            <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '30px 50px', flex: 1 }}>
                        <section style={{ marginBottom: '35px' }}>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>{data.summary}</p>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                            <section>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '20px' }}>Clinical Experience</h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '25px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: '0 0 2px 0' }}>{exp.role}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{exp.company}</span>
                                            <span style={{ fontSize: '11px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                                        </div>
                                        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </section>

                            <div>
                                <section style={{ marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Analysis Stack</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {data.skills.split(',').map((skill, i) => (
                                            <span key={i} style={{ fontSize: '10px', color: '#111', border: `1px solid ${templateConfig.primaryColor}`, padding: '4px 8px', borderRadius: '3px', fontWeight: '700' }}>
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Credentials</h3>
                                    <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                                </section>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
      </div>

      

      

    </div>
  );
}