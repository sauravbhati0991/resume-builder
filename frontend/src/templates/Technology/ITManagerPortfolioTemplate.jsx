import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

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

export default function ITManagerPortfolioTemplate({ templateId, saveResume, downloadResume }) {
  const navigate = useNavigate();
  const previewRef = useRef();
  // const { templateId } = useParams(); // Removed since it's now coming from props

  const templateConfig = {
    name: "IT Manager Portfolio",
    primaryColor: "#1E90FF", 
    accentColor: "#333333",  
    defaultData: {
      firstName: "Robert",
      lastName: "Lang",
      title: "IT Manager",
      email: "robert.it@example.com",
      phone: "+1 555 4321",
      location: "Chicago, IL",
      summary: "Strategic IT Manager with over 15 years of experience leading cross-functional technical teams. Proven success in digital transformation, IT budget management ($2M+), and aligning technology initiatives with business goals.",
      skills: "IT Strategy, Budget Management, Team Leadership, Agile/Scrum, Vendor Management, Cloud Migration, Disaster Recovery",
      experience: [
        { role: "IT Manager", company: "Global Corp", dates: "2018 - Present", description: "Oversee IT operations for 500+ employees globally. Successfully led a company-wide ERP migration under budget. Mentored a team of 15 sysadmins and developers." },
        { role: "Senior Systems Administrator", company: "Tech Services LLC", dates: "2013 - 2018", description: "Managed Windows/Linux server infrastructure. Implemented rigorous security patching protocols achieving 99.99% uptime." }
      ],
      education: "MBA, University of Chicago (2015)\nB.S. Computer Science, Purdue (2010)"
    }
  };

  const [zoom, setZoom] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState("");
  const [data, setData] = useState(templateConfig.defaultData);

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
        alert(`Resume saved successfully to database! (ID: ${cvNumber})`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const runDownloadProcess = async () => {
    try {
      setIsDownloading(true);

      // 1. Save to DB and get CV Number
      const res = await api.post("/resumes", {
        templateId,
        templateName: templateConfig.name,
        categoryName: "Technology and IT",
        resumeData: data
      });

      const cvNumber = res.data.cvNumber;

      // 2. Generate PDF locally
      const worker = html2pdf()
        .set({
          margin: 0,
          filename: `${cvNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 3, 
            useCORS: true, 
            letterRendering: true,
            scrollX: 0,
            scrollY: -window.scrollY
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(previewRef.current);

      const pdfBlob = await worker.output('blob');

      // 3. Upload PDF to server
      const formData = new FormData();
      formData.append("file", pdfBlob, `${cvNumber}.pdf`);
      formData.append("cvNumber", cvNumber);

      await api.post("/resume-upload/resume-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 4. Trigger download
      await worker.save();

      setGeneratedCvNumber(cvNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Resume Save Failed:", err);
    } finally {
      setIsDownloading(false);
      setShowReplaceModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* HEADERBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <span className="font-semibold text-gray-700">{templateConfig.name} Builder</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />} Save
                </button>
                <button 
                  onClick={() => setShowReplaceModal(true)} 
                  disabled={isDownloading} 
                  className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 disabled:opacity-70" 
                  style={{ backgroundColor: templateConfig.accentColor }}
                >
                  {isDownloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </button>
            </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* EDITOR */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Leadership Profile</h3>
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
                    <textarea rows={4} id="summary" name="summary" value={data.summary} onChange={handleInputChange} className="w-full border rounded-md p-2 text-sm"/>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                     <div className="flex justify-between mb-4">
                       <h3 className="text-lg font-bold">Experience</h3>
                       <button onClick={addExperience} className="text-sm text-blue-600 font-bold">+ Add</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16}/>
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Role" name="role" value={exp.role} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Company" name="company" value={exp.company} onChange={(e)=>handleArrayChange(i,'experience',e)}/>
                                <InputGroup label="Dates" name="dates" value={exp.dates} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2"/>
                                <textarea rows={3} id="description" name="description" value={exp.description} onChange={(e)=>handleArrayChange(i,'experience',e)} className="col-span-2 border rounded p-2 text-sm"/>
                            </div>
                        </div>
                     ))}
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Competencies</h3>
                    <InputGroup label="Key Skills" name="skills" value={data.skills} onChange={handleInputChange}/>
                    <div className="h-4"></div>
                    <InputGroup label="Education" name="education" value={data.education} onChange={handleInputChange}/>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
                <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    <div style={{ padding: '40px 50px', borderBottom: `4px solid ${templateConfig.primaryColor}` }}>
                        <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#222', margin: '0 0 5px 0' }}>{data.firstName} {data.lastName}</h1>
                        <p style={{ fontSize: '18px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{data.title}</p>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#555', display: 'flex', gap: '20px' }}>
                            <span>{data.email}</span>
                            <span>|</span>
                            <span>{data.phone}</span>
                            <span>|</span>
                            <span>{data.location}</span>
                        </div>
                    </div>

                    <div style={{ padding: '40px 50px', flex: 1 }}>
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Executive Summary</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{data.summary}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '20px' }}>Professional Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '25px', paddingLeft: '20px', borderLeft: `4px solid #f0f0f0` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{exp.role}</h4>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{exp.dates}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#444' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Strategic Competencies</h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#333' }}>{data.skills}</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Education</h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>{data.education}</p>
                            </div>
                        </div>
                    </div>

                    {generatedCvNumber && (
                      <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        ID: {generatedCvNumber} • Verify at: resumea.com/cv/{generatedCvNumber}
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Resume?</h3>
            <p className="text-sm text-gray-600 mb-6">This will save your latest changes to our server and generate your PDF.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={runDownloadProcess} disabled={isDownloading} className="px-4 py-2 rounded-lg text-white disabled:opacity-70" style={{ backgroundColor: templateConfig.primaryColor }}>
                {isDownloading ? "Generating..." : "Yes, Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">Success!</h3>
            <p className="text-sm text-gray-600 mb-2">Your resume has been saved and your ID is:</p>
            <p className="text-lg font-mono font-bold text-gray-900 mb-6 underline">{generatedCvNumber}</p>
            <button onClick={() => setShowSuccessModal(false)} className="px-8 py-2 rounded-lg text-white" style={{ backgroundColor: templateConfig.primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}