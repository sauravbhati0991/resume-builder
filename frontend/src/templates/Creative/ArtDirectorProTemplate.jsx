import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Palette, Eye, Type, Camera } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange} 
      className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-sm focus:outline-none focus:border-purple-600 transition-all font-medium" 
    />
  </div>
);

export default function ArtDirectorProTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Art Director Pro",
    primaryColor: "#2D0031", // Deep Eggplant
    accentColor: "#D4FF00",  // Neon Lime
    defaultData: {
      firstName: "Maya",
      lastName: "Lin",
      title: "Senior Art Director",
      email: "maya.art@example.com",
      phone: "+1 555 432 1098",
      location: "Los Angeles, CA",
      summary: "Multidisciplinary Art Director with a sharp eye for aesthetic detail and visual communication. Specialized in fashion, lifestyle, and luxury brand identity. Adept at translating marketing objectives into stunning, cohesive visual ecosystems.",
      skills: "Art Direction, Photoshoot Styling, Typography, Layout Design, Brand Identity, Adobe Creative Suite, Figma",
      experience: [
        { role: "Senior Art Director", company: "Vogue Studios", dates: "2020 - Present", description: "Direct conceptual and visual development for seasonal fashion campaigns. Manage on-set photography, casting, and post-production retouching teams." },
        { role: "Art Director", company: "Luxe Branding Co.", dates: "2016 - 2020", description: "Designed packaging and visual identity for 5+ luxury skincare lines. Oversaw junior designers and freelance illustrators." }
      ],
      education: "B.A. Graphic Design, ArtCenter College of Design (2016)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
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
    <div className="min-h-screen w-full bg-[#f3f3f3] flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* STUDIO TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-black hover:bg-slate-100 h-9 px-4 uppercase tracking-tighter border-2 border-black transition-all">
                  <ArrowLeft className="w-4 h-4 inline mr-2" /> Back
                </button>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-700" />
                  <span className="font-black text-sm uppercase tracking-widest">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: templateConfig.accentColor }}>
                    {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* CREATIVE INPUTS */}
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-8 mt-4">
                <div className="bg-white p-8 border-2 border-black">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-black uppercase tracking-[0.2em] border-b-2 border-black pb-2"><Eye className="w-4 h-4" /> Visual Identity</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="First_Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                        <InputGroup label="Last_Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                        <InputGroup label="Creative_Role" name="title" value={data.title} onChange={handleInputChange} className="col-span-2"/>
                        <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                        <InputGroup label="Contact" name="phone" value={data.phone} onChange={handleInputChange}/>
                        <InputGroup label="Base_Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-8 border-2 border-black">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2">Director's Statement</h3>
                    <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full bg-slate-50 p-4 text-sm font-medium focus:ring-0 focus:outline-none border-b-4 border-purple-200 mt-2"/>
                </div>

                <div className="bg-white p-8 border-2 border-black">
                     <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">Campaign History</h3>
                        <button onClick={addExperience} className="text-[10px] bg-black text-white px-3 py-1 font-black uppercase">+ Add_Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6 p-6 bg-slate-50 border-l-8 border-purple-600 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Studio/Agency" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Timeline" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe the creative vision, team management, and KPIs..." value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border-none bg-white p-3 text-sm font-medium mt-2"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-8 border-2 border-black">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2">Creative Toolbox</h3>
                    <InputGroup label="Skills & Software" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-8"></div>
                    <InputGroup label="Education & Credentials" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* ART PREVIEW */}
            <div className="h-full bg-slate-800 flex justify-center p-12 overflow-auto custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '0', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ border: `4px solid ${templateConfig.primaryColor}`, margin: '25px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        
                        {/* Masthead */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `4px solid ${templateConfig.primaryColor}`, padding: '40px' }}>
                            <div style={{ maxWidth: '60%' }}>
                                <h1 style={{ fontSize: '56px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '-2px', lineHeight: '0.8', margin: 0 }}>
                                    {data.firstName}<br/>{data.lastName}
                                </h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ backgroundColor: templateConfig.accentColor, color: 'black', padding: '10px 20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px', border: '2px solid black', display: 'inline-block' }}>
                                    {data.title}
                                </div>
                                <div style={{ marginTop: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#666', letterSpacing: '1px' }}>
                                    {data.location} • {data.phone}
                                </div>
                            </div>
                        </div>

                        {/* Secondary Navigation (Contact) */}
                        <div style={{ padding: '15px 40px', backgroundColor: templateConfig.primaryColor, color: templateConfig.accentColor, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Portfolio: linktr.ee/{data.lastName.toLowerCase()}</span>
                            <span>{data.email}</span>
                        </div>

                        {/* Content Grid */}
                        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '40px', flex: 1 }}>
                            
                            {/* Left Column: Sidebar Info */}
                            <div style={{ borderRight: '2px solid #eee', paddingRight: '20px' }}>
                                <section style={{ marginBottom: '40px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: templateConfig.primaryColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Type size={14} /> Toolbox
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {data.skills.split(',').map((skill, i) => (
                                            <div key={i} style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                                                {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: templateConfig.primaryColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Camera size={14} /> Academic
                                    </h3>
                                    <p style={{ fontSize: '11px', lineHeight: '1.6', fontWeight: '700', color: '#555', textTransform: 'uppercase' }}>
                                        {data.education}
                                    </p>
                                </section>
                            </div>

                            {/* Right Column: Experience */}
                            <div>
                                <section style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '30px' }}>
                                    <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#111', fontWeight: '500', fontStyle: 'italic' }}>
                                        "{data.summary}"
                                    </p>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: templateConfig.primaryColor, marginBottom: '30px' }}>Campaign History</h3>
                                    {data.experience.map((exp, i) => (
                                        <div key={i} style={{ marginBottom: '40px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', color: '#000', margin: 0 }}>{exp.role}</h4>
                                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#999' }}>{exp.dates}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: '900', color: templateConfig.primaryColor, marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                                            <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#444' }}>{exp.description}</p>
                                        </div>
                                    ))}
                                </section>
                            </div>
                        </div>

                        {/* Footer / Serial */}
                        
                    </div>
                </div>
            </div>
        </div>
      </div>

      

      

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