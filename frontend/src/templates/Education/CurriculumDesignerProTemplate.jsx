import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default function CurriculumDesignerProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Curriculum Designer Pro",
    primaryColor: "#FF8C00", // Dark Orange
    accentColor: "#000080",  // Navy Blue
    defaultData: {
      firstName: "Elena",
      lastName: "Rios",
      title: "Lead Curriculum Designer",
      email: "elena.rios@edtech.com",
      phone: "+1 (555) 765-4321",
      location: "San Francisco, CA",
      summary: "Innovative Curriculum Designer with a strong background in instructional design and EdTech. Passionate about creating interactive, accessible, and highly effective learning modules for both K-12 and corporate training environments.",
      skills: "Instructional Design, Articulate Storyline, Canvas LMS, Storyboarding, Needs Analysis, Gamification, ADDIE Model",
      experience: [
        { role: "Lead Instructional Designer", company: "Global EdTech Solutions", dates: "2019 - Present", description: "Design and deploy asynchronous learning modules used by over 50,000 students. Reduced course development time by 20% by implementing agile design frameworks." },
        { role: "Curriculum Developer", company: "Bay Area School District", dates: "2015 - 2019", description: "Overhauled the district's science curriculum to meet Next Generation Science Standards (NGSS). Led training workshops for 100+ teachers." }
      ],
      education: "M.S. Instructional Design & Technology, SF State (2015)\nB.S. Education (2013)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...data[arrayName]];
    newArray[index][field] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const cvNumber = await saveAndGeneratePDF(data);
      if (cvNumber) {
        setGeneratedCvNumber(cvNumber);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePdfDownload = async (cvNumber) => {
    try {
      const res = await api.get(`/resumes/view/${cvNumber}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans text-slate-800">

      {/* TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <span className="font-semibold text-gray-700">{templateConfig.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="mr-2" />
              )}

              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md ${generatedCvNumber
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Download className="mr-2" /> Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">

          {/* EDITOR */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Summary</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Experience Design</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Entry</button></div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Organization" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Design Arsenal & Education</h3>
              <InputGroup label="Skills (separate with commas)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Education" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

              {/* Modern Split Header */}
              <div style={{ display: 'flex', height: '180px' }}>
                <div style={{ flex: '2', backgroundColor: templateConfig.accentColor, color: 'white', padding: '40px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{data.firstName} {data.lastName}</h1>
                  <p style={{ fontSize: '18px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{data.title}</p>
                </div>
                <div style={{ flex: '1', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {data.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> {data.location}</div>
                </div>
              </div>

              <div style={{ padding: '40px 50px', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                  {/* Left Column */}
                  <div>
                    <section style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px' }}>Design Arsenal</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {data.skills.split(',').map((skill, i) => (
                          <span key={i} style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: 'white', color: templateConfig.accentColor, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${templateConfig.primaryColor}` }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                      <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.education}</p>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div>
                    <section style={{ marginBottom: '35px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Profile</h3>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                    </section>
                    <section>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.accentColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '5px', marginBottom: '20px' }}>Experience Design</h3>
                      {data.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '25px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#222', margin: 0 }}>{exp.role}</h4>
                            <span style={{ fontSize: '12px', color: '#777', fontWeight: 'bold' }}>{exp.dates}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', margin: 0 }}>{exp.description}</p>
                        </div>
                      ))}
                    </section>
                  </div>
                </div>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '25px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  CV ID: {generatedCvNumber} • Verification: resumea.com/cv/{generatedCvNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}