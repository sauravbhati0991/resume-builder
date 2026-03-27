import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

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

export default function AccountManagerPortfolioTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const previewRef = useRef();
  const { templateId } = useParams();

  const templateConfig = {
    name: "Account Manager Portfolio",
    primaryColor: "#FF4500", // Red
    accentColor: "#FFD700",  // Yellow
    defaultData: {
      firstName: "Nathan",
      lastName: "Scott",
      title: "Key Account Manager",
      email: "n.scott@example.com",
      phone: "+1 555 666 7777",
      location: "Dallas, TX",
      summary: "Dedicated Key Account Manager with a reputation for transforming at-risk accounts into loyal, top-tier clients. Expert in relationship management, upselling strategies, and client onboarding within the B2B tech sector.",
      skills: "Client Retention, Upselling/Cross-selling, Needs Analysis, B2B Relationship Building, CRM Management, Contract Renewal",
      experience: [
        { role: "Key Account Manager", company: "DataSync Solutions", dates: "2019 - Present", description: "Manage a portfolio of 40 enterprise clients generating $4.5M in annual recurring revenue. Achieved a 98% client retention rate over 3 years." },
        { role: "Client Success Specialist", company: "CloudBridge", dates: "2015 - 2019", description: "Led onboarding and training for new software implementations. Identified upsell opportunities resulting in $500k additional revenue." }
      ],
      education: "B.A. in Business Communications, Texas A&M (2015)"
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

      {/* HEADER BAR */}
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
              className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2 text-indigo-600" />
              )}
              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 ${generatedCvNumber
                ? "hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              style={{ backgroundColor: generatedCvNumber ? templateConfig.primaryColor : undefined }}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">

          {/* EDITOR */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Professional Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Work Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Mobile Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Office Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Value Proposition (Summary)</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Career History</h3><button onClick={addExperience} className="text-sm text-blue-600 font-bold hover:underline">+ Add Experience</button></div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Job Title" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Organization" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Tenure" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Strategic Skills & Education</h3>
              <InputGroup label="Core Competencies" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Academic Background" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

              <div style={{ padding: '50px', textAlign: 'center', borderBottom: `5px solid ${templateConfig.accentColor}` }}>
                <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', margin: 0 }}>
                  {data.firstName} <span style={{ color: templateConfig.primaryColor }}>{data.lastName}</span>
                </h1>
                <h2 style={{ fontSize: '16px', color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', margin: 0 }}>
                  {data.title}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#444' }}>
                  <span>{data.email}</span>
                  <span style={{ color: templateConfig.primaryColor }}>|</span>
                  <span>{data.phone}</span>
                  <span style={{ color: templateConfig.primaryColor }}>|</span>
                  <span>{data.location}</span>
                </div>
              </div>

              <div style={{ padding: '40px 50px', flex: 1 }}>
                <section style={{ marginBottom: '35px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '10px' }}>Professional Profile</h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#444', textAlign: 'justify', margin: 0 }}>{data.summary}</p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px' }}>Strategic Experience</h3>
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px dashed #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor }}>{exp.dates}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#555', fontWeight: '600', marginBottom: '10px' }}>{exp.company}</div>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                    </div>
                  ))}
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Competencies</h3>
                    <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.6' }}>
                      {data.skills.split(',').map((skill, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{skill.trim()}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px' }}>Education</h3>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                  </div>
                </div>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '30px', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  PORTFOLIO ID: {generatedCvNumber} • Verification: resumea.com/verify/{generatedCvNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-orange-500">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-orange-100">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic tracking-tighter">Account Secured</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Your portfolio of influence has been serialized. Portfolio ID:</p>
            <div className="bg-slate-900 py-4 rounded-xl font-mono text-xl font-bold text-orange-400 mb-8 tracking-[0.2em] shadow-inner border-2 border-slate-800 uppercase">{generatedCvNumber}</div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>Return to Pipeline</button>
          </div>
        </div>
      )}
    </div>
  );
}