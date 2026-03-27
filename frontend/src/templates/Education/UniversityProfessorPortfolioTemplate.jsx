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

export default function UniversityProfessorPortfolioTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "University Professor",
    primaryColor: "#FF8C00", // Dark Orange
    accentColor: "#000080",  // Navy Blue
    defaultData: {
      firstName: "Dr. Arthur",
      lastName: "Pendleton",
      title: "Professor of Sociology",
      email: "a.pendleton@university.edu",
      phone: "+1 (555) 321-4321",
      location: "Princeton, NJ",
      summary: "Tenured Professor of Sociology with over 20 years of research and teaching experience. Published author of 3 books and 40+ peer-reviewed articles. Dedicated to mentoring graduate students and fostering rigorous academic inquiry.",
      skills: "Qualitative Research, Grant Writing, Graduate Mentorship, Curriculum Development, Public Speaking, Statistical Analysis",
      experience: [
        { role: "Tenured Professor", company: "Princeton University", dates: "2010 - Present", description: "Teach undergraduate and graduate courses in Social Theory. Secured over $2M in research grants. Chaired the departmental review committee." },
        { role: "Associate Professor", company: "University of Chicago", dates: "2003 - 2010", description: "Developed 4 new syllabi. Published 'Modern Social Structures' which became a required text in 15 universities." }
      ],
      education: "Ph.D. in Sociology, Harvard University (2003)\nM.A. in Sociology, Yale University (1999)"
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
            <span className="font-semibold text-gray-700">{templateConfig.name} CV Builder</span>
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
              <h3 className="text-lg font-bold mb-4">Academic Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Academic Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Location / Primary Institution" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Academic Overview</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Academic Appointments</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Entry</button></div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="University / Department" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Research & Education</h3>
              <InputGroup label="Research Areas (Separate by comma)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Degrees & Credentials" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

              <div style={{ padding: '50px 60px', fontFamily: 'Georgia, serif', color: '#111', flex: 1 }}>

                {/* Centered Academic Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '36px', fontWeight: 'normal', color: templateConfig.accentColor, marginBottom: '10px' }}>
                    {data.firstName} {data.lastName}
                  </h1>
                  <h2 style={{ fontSize: '16px', fontWeight: 'normal', fontStyle: 'italic', color: '#444', marginBottom: '15px' }}>
                    {data.title}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#555', letterSpacing: '0.5px' }}>
                    {data.location} | {data.phone} | {data.email}
                  </div>
                </div>

                {/* Thin Orange Separator */}
                <div style={{ height: '1px', backgroundColor: templateConfig.primaryColor, marginBottom: '40px' }}></div>

                {/* Academic Summary */}
                <div style={{ marginBottom: '40px' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'justify' }}>{data.summary}</p>
                </div>

                {/* Academic Appointments */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Appointments</h3>
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{exp.company}</h4>
                        <span style={{ fontSize: '13px', fontStyle: 'italic' }}>{exp.dates}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '10px', color: '#555' }}>{exp.role}</div>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Education</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{data.education}</p>
                </div>

                {/* Research Areas */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.accentColor, borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Areas of Research & Expertise</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    {data.skills.split(',').map((skill, i) => (
                      <span key={i} style={{ display: 'inline-block', marginRight: '20px', marginBottom: '5px' }}>
                        <span style={{ color: templateConfig.primaryColor, fontWeight: 'bold' }}>•</span> {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '40px', fontSize: '10px', color: '#94a3b8', fontFamily: 'serif' }}>
                  Academic Record ID: {generatedCvNumber} • Digital Verification: resumea.com/verify/{generatedCvNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}