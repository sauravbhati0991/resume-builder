import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, MousePointer2, Layout, Figma, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-[0.2em]">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full rounded-lg border-2 border-slate-100 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors font-medium text-slate-700" 
    />
  </div>
);

export default function UxUiDesignerModernTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "UX/UI Designer Modern",
    primaryColor: "#0F172A", // Slate 900
    accentColor: "#D1FAE5",  // Emerald 100
    defaultData: {
      firstName: "Leo",
      lastName: "Martinez",
      title: "Product / UX Designer",
      email: "leo.ux@example.com",
      phone: "+1 555 777 8888",
      location: "San Francisco, CA",
      summary: "Human-centric UX/UI Designer with a background in cognitive psychology. Dedicated to creating intuitive, accessible, and delightful digital products. Experienced in end-to-end design from user research and wireframing to high-fidelity prototyping and design systems.",
      skills: "Figma, Sketch, Prototyping, User Research, Usability Testing, HTML/CSS, Design Systems, Wireframing",
      experience: [
        { role: "Senior Product Designer", company: "TechFlow Apps", dates: "2021 - Present", description: "Lead design for a B2B SaaS dashboard used by 10k+ businesses. Created and maintained a comprehensive Figma design system that accelerated development handoff by 30%." },
        { role: "UX/UI Designer", company: "Creative Startups", dates: "2018 - 2021", description: "Designed mobile applications for 4 early-stage startups. Conducted weekly user testing sessions to iterate on MVP features and reduced churn by 12%." }
      ],
      education: "B.S. Interaction Design, California College of the Arts (2018)"
    }
  };

  // MASTER PATTERN STATE
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

  // Quick Save (Draft Cache)
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
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* DESIGNER TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-50 h-9 px-4 uppercase rounded-xl transition-all flex items-center text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <div className="h-6 w-px bg-slate-100 mx-2"></div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs uppercase tracking-widest text-slate-800">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all uppercase flex items-center text-slate-700">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4 mr-2" />} Save_Draft
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="text-xs font-bold h-9 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4 mr-2" />} Export_PDF
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* COMPONENT EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6 pt-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 text-slate-900 uppercase tracking-[0.3em]"><Layout className="w-4 h-4" /> Attributes</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="User_First" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="User_Last" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Professional_Role" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email_Node" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact_Line" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Base_Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-slate-900">User Summary</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-100 focus:outline-none border-none mt-2 text-slate-600 leading-relaxed"/>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Case Studies / Roles</h3>
                        <button onClick={addExperience} className="text-[10px] text-purple-600 font-bold uppercase tracking-widest hover:underline">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 rounded-2xl border border-slate-50 bg-slate-50/50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Title" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Organization" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Highlight metrics and tools used..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 bg-white border border-slate-100 rounded-xl p-3 text-sm font-medium mt-2 outline-none focus:border-purple-200 transition-all"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-black mb-4 uppercase tracking-[0.3em] text-slate-900">Toolkit & Knowledge</h3>
                    <InputGroup label="Skills (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-8"></div>
                    <InputGroup label="Education_History" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* DESIGN PREVIEW */}
            <div className="h-full bg-slate-100 flex justify-center p-12 overflow-auto custom-scrollbar rounded-tl-[3rem]">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '80px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                        <div>
                            <h1 style={{ fontSize: '48px', fontWeight: '800', color: templateConfig.primaryColor, letterSpacing: '-2px', lineHeight: '0.9', margin: '0 0 15px 0' }}>
                                {data.firstName}<br/>{data.lastName}
                            </h1>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <Figma size={16} /> {data.title}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', fontWeight: '600', lineHeight: '2' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '60px' }}>
                        <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#475569', maxWidth: '90%', fontWeight: '450' }}>{data.summary}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '60px', flex: 1 }}>
                        
                        <div>
                            <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Selected Case Studies</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: templateConfig.primaryColor, margin: 0 }}>{exp.role}</h4>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1', marginBottom: '12px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#64748b' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <section style={{ marginBottom: '50px' }}>
                                <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Toolkit</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ fontSize: '10px', fontWeight: '800', color: '#065f46', backgroundColor: templateConfig.accentColor, padding: '6px 14px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Academic</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', fontWeight: '600' }}>{data.education}</p>
                            </section>

                            
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>UX_UI Portfolio System v2.0</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }}></div>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: templateConfig.accentColor }}></div>
                        </div>
                    </div>
                </div>
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