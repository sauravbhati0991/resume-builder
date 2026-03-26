import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
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
  TrendingUp,
  Award
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
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
    />
  </div>
);

export default function SalesTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
  const previewRef = useRef();
  
  // --- CONFIGURATION ---
  const templateConfig = {
    name: "Sales & Marketing",
    primaryColor: "#FF4500", // Red - Passion and Action
    accentColor: "#DAA520",  // Goldenrod (Darker yellow for better readability than pure #FFD700)
    defaultData: {
      firstName: "Jessica",
      lastName: "Lee",
      title: "Senior Sales Executive",
      email: "jess.sales@example.com",
      phone: "+1 555 9876",
      location: "San Francisco, CA",
      summary: "Results-driven Sales Executive with a track record of exceeding quotas by 150%. Expert in B2B relationship building, strategic negotiation, and pipeline management. Closed over $5M in revenue in the last fiscal year.",
      skills: "Strategic Negotiation, B2B Sales, CRM (Salesforce/HubSpot), Lead Generation, Account Management, Revenue Forecasting",
      experience: [
        { role: "Senior Account Executive", company: "TechGrowth SaaS", dates: "2020 - Present", description: "Expanded market share in the West Coast region by 200%. Successfully negotiated and closed contracts with 5 Fortune 500 companies. Mentored a team of 4 junior sales representatives." }
      ],
      education: "BA Marketing, UCLA (2016-2020)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [data, setData] = useState(initialData || { ...templateConfig.defaultData, cvNumber: "" });

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
                  <TrendingUp className="w-4 h-4 text-white" />
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
                <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                          <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e)=>handleArrayChange(index,'experience',e)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <Award className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Skills</h3>
                </div>
                <textarea rows={3} value={data.skills} id="skills" name="skills" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

               <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                  <GraduationCap className="w-5 h-5" style={{ color: templateConfig.primaryColor }} />
                  <h3>Education</h3>
                </div>
                <textarea rows={3} value={data.education} id="education" name="education" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* --- RIGHT: Preview --- */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(to right, ${templateConfig.primaryColor}, #111827)` }}>
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
                  
                  {/* --- PDF CONTENT (BOLD IMPACT LAYOUT) --- */}
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Header Box */}
                    <header style={{ backgroundColor: templateConfig.primaryColor, padding: '2.5rem', color: 'white' }}>
                      <h1 style={{ fontSize: '3rem', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1', marginBottom: '0.5rem' }}>
                        {data.firstName} <br/> {data.lastName}
                      </h1>
                      <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#FEF3C7' }}>{data.title}</p>
                    </header>

                    {/* Info Bar */}
                    <div style={{ backgroundColor: '#111827', color: 'white', padding: '0.75rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      <span>{data.email}</span>
                      <span>{data.phone}</span>
                      <span>{data.location}</span>
                    </div>

                    {/* Main Content Grid - Using CSS Grid for PDF Safety */}
                    <div style={{ display: 'grid', gridTemplateColumns: '65% 30%', gap: '5%', padding: '2.5rem', flex: 1 }}>
                      
                      {/* Left Column (Main) */}
                      <div>
                        <section style={{ marginBottom: '2rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: `4px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', display: 'inline-block' }}>
                            Career Profile
                          </h3>
                          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>{data.summary}</p>
                        </section>

                        <section>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: `4px solid ${templateConfig.primaryColor}`, paddingBottom: '0.25rem', display: 'inline-block' }}>
                            Performance History
                          </h3>
                          
                          {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '2rem' }}>
                              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{exp.role}</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold', color: '#6B7280', marginBottom: '0.5rem' }}>
                                <span>{exp.company}</span>
                                <span style={{ color: templateConfig.primaryColor }}>{exp.dates}</span>
                              </div>
                              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', borderLeft: `4px solid ${templateConfig.primaryColor}` }}>
                                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5', margin: 0 }}>{exp.description}</p>
                              </div>
                            </div>
                          ))}
                        </section>
                      </div>

                      {/* Right Column (Sidebar) */}
                      <div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1.5rem', borderRadius: '0.75rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', color: '#111827' }}>Key Skills</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {data.skills.split(',').map((skill, i) => (
                              <div key={i}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#4B5563', display: 'block', marginBottom: '0.25rem' }}>{skill.trim()}</span>
                                <div style={{ height: '0.5rem', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px' }}>
                                  <div style={{ height: '100%', width: '85%', backgroundColor: templateConfig.accentColor, borderRadius: '9999px' }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <h3 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', marginTop: '2rem', marginBottom: '1rem', color: '#111827' }}>Education</h3>
                          <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>{data.education}</p>
                        </div>
                      </div>

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
            {/* ✅ FOOTER: Unique Verification Link */}
            {data.cvNumber && (
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '20px',
                        fontSize: '9px',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        pointerEvents: 'none'
                      }}>
                        ID: {data.cvNumber} • Verify at: resumea.com/cv/{data.cvNumber}
                      </div>
                    )}
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