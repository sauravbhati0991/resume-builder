import { useState, useRef } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Briefcase, 
  GraduationCap, 
  User, 
  Code, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Layers
} from 'lucide-react';

// Common Input Component
const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input 
      type="text" 
      id={name}
      name={name}
      value={value} 
      onChange={onChange}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
    />
  </div>
);

export default function GeneralTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "General Purpose",
    primaryColor: "#2563EB", // Royal Blue - Universal Professionalism
    accentColor: "#374151",  // Dark Gray - Neutral Contrast
    defaultData: {
      firstName: "Alex",
      lastName: "Jordan",
      title: "Professional Title",
      email: "alex.jordan@email.com",
      phone: "+1 555 0102",
      location: "City, State",
      summary: "A highly motivated and results-oriented professional with a strong background in [Industry/Field]. Proven track record of [Key Achievement 1] and [Key Achievement 2]. Seeking to leverage skills in [Skill 1] and [Skill 2] to contribute to company success.",
      skills: "Skill Set 1, Skill Set 2, Soft Skill 1, Technical Skill, Industry Knowledge, Software Proficiency",
      experience: [
        { role: "Job Title", company: "Company Name", dates: "2020 - Present", description: "Describe your key responsibilities and achievements here. Use active verbs (e.g., Managed, Created, Increased) to start each sentence." },
        { role: "Previous Job Title", company: "Previous Company", dates: "2018 - 2020", description: "Focused on [Task A] and [Task B]. Collaborated with cross-functional teams to deliver projects on time." }
      ],
      education: "Degree Name, University Name (Year) | Certification Name, Institution (Year)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  // --- HANDLERS ---
  const handleInputChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleArrayChange = (index, arrayName, e) => {
    const { name, value } = e.target;
    const newArray = [...data[arrayName]];
    newArray[index][name] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addExperience = () => setData(prev => ({
    ...prev,
    experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }]
  }));

  const removeExperience = (index) => setData(prev => ({
    ...prev,
    experience: prev.experience.filter((_, i) => i !== index)
  }));

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
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/templates')} className="inline-flex items-center justify-center text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 h-9 px-3 rounded-md">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg shadow-sm" style={{ backgroundColor: templateConfig.primaryColor }}>
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700 hidden sm:inline">{templateConfig.name} Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
              </button>
              <button onClick={downloadPDF} className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-opacity hover:opacity-90" style={{ backgroundColor: '#111827' }}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          
          {/* --- EDITOR (Left) --- */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="pb-20 space-y-6">
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <User className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange}/>
                  <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange}/>
                  <InputGroup label="Job Title" name="title" value={data.title} onChange={handleInputChange} className="md:col-span-2"/>
                  <InputGroup label="Email" name="email" value={data.email} onChange={handleInputChange}/>
                  <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange}/>
                  <InputGroup label="Location" name="location" value={data.location} onChange={handleInputChange} className="md:col-span-2"/>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <FileText className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Professional Summary</h3>
                </div>
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Briefcase className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                    <h3>Experience</h3>
                  </div>
                  <button onClick={addExperience} className="text-sm px-2 py-1 rounded flex items-center gap-1 hover:opacity-80" style={{ color: templateConfig.primaryColor, backgroundColor: `${templateConfig.primaryColor}15` }}>
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                      <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(index,'experience',e)}/>
                        <InputGroup label="Company" name="company" value={exp.company} onChange={(e)=>handleArrayChange(index,'experience',e)}/>
                        <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(index,'experience',e)} className="md:col-span-2"/>
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(index,'experience',e)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Code className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills</h3>
                </div>
                <textarea rows={3} value={data.skills} id="skills" name="skills" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} id="education" name="education" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>
          </div>

          {/* --- RIGHT: Preview --- */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(to right, ${templateConfig.primaryColor}, ${templateConfig.accentColor})` }}>
              <span className="text-sm font-medium text-white/90">Live Preview</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-white hover:text-blue-200">-</button>
                <span className="text-xs text-white font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="text-white hover:text-blue-200">+</button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 flex justify-center items-start overflow-auto flex-1 custom-scrollbar">
              <div 
                className="shadow-2xl transition-transform duration-200 bg-white"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  width: '210mm', 
                  minHeight: '297mm',
                }}
              >
                <div ref={previewRef} className="h-full w-full bg-white">
                  
                  {/* --- PDF CONTENT (GENERAL UNIVERSAL LAYOUT) --- */}
                  <div style={{ 
                    height: '100%', 
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', 
                    color: '#333',
                    display: 'grid',
                    gridTemplateColumns: '30% 65%',
                    gap: '5%'
                  }}>
                    
                    {/* Sidebar Column */}
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: '2.5rem 1.5rem', 
                      borderRight: '1px solid #e2e8f0',
                      height: '100%' 
                    }}>
                      {/* Avatar / Initials Placeholder */}
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: templateConfig.primaryColor, 
                        color: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '2rem'
                      }}>
                        {data.firstName.charAt(0)}{data.lastName.charAt(0)}
                      </div>

                      {/* Contact */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', color: templateConfig.primaryColor, letterSpacing: '0.05em' }}>
                          Contact
                        </h3>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={12}/> {data.email}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={12}/> {data.phone}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={12}/> {data.location}</div>
                        </div>
                      </div>

                      {/* Education */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', color: templateConfig.primaryColor, letterSpacing: '0.05em' }}>
                          Education
                        </h3>
                        <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: '#334155' }}>{data.education}</p>
                      </div>

                      {/* Skills */}
                      <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', color: templateConfig.primaryColor, letterSpacing: '0.05em' }}>
                          Skills
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {data.skills.split(',').map((skill, i) => (
                            <span key={i} style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: 'white', 
                              border: '1px solid #cbd5e1',
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px',
                              color: '#475569',
                              fontWeight: '500'
                            }}>
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Main Content Column */}
                    <div style={{ padding: '2.5rem 0' }}>
                      
                      {/* Name & Title */}
                      <header style={{ marginBottom: '2.5rem', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '2.75rem', fontWeight: '800', lineHeight: '1', color: '#1e293b', marginBottom: '0.5rem' }}>
                          {data.firstName} <br/> {data.lastName}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: templateConfig.accentColor, fontWeight: '500' }}>{data.title}</p>
                      </header>

                      {/* Profile */}
                      <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: templateConfig.primaryColor, borderRadius: '50%' }}></span> Profile
                        </h3>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#475569' }}>{data.summary}</p>
                      </section>

                      {/* Experience */}
                      <section>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: templateConfig.primaryColor, borderRadius: '50%' }}></span> Experience
                        </h3>
                        
                        {data.experience.map((exp, i) => (
                          <div key={i} style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{exp.role}</h4>
                              <span style={{ fontSize: '0.8rem', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                              {exp.company}
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#334155' }}>
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </section>

                    </div>

                  </div>
                  {/* --- END PDF CONTENT --- */}
                  
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
              <span>Scroll to see more</span>
              <div className="flex items-center gap-1" style={{ color: templateConfig.primaryColor }}>
                <Eye className="w-3 h-3"/> Preview Mode
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