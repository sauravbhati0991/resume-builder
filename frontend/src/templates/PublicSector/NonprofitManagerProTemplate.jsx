import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Heart, Users, Globe, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]" />
  </div>
);

export default function NonprofitManagerProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Nonprofit Manager Pro",
    primaryColor: "#8B0000",
    accentColor: "#D3D3D3",
    defaultData: {
      firstName: "Samantha",
      lastName: "Gomez",
      title: "Nonprofit Program Manager",
      email: "s.gomez@nonprofit.org",
      phone: "+1 555 777 8888",
      location: "Austin, TX",
      summary: "Mission-driven Nonprofit Manager with a decade of experience designing, funding, and executing community outreach programs. Expert in grant writing, volunteer mobilization, and optimizing program budgets to maximize social impact.",
      skills: "Grant Writing, Donor Relations, Volunteer Management, Program Evaluation, Event Planning, Budget Administration, Public Speaking",
      experience: [
        { role: "Program Manager", company: "Texas Community Action", dates: "2017 - Present", description: "Directed a city-wide food security program serving 5,000 families monthly. Secured $1.2M in recurring foundation grants. Managed a database of over 400 active volunteers." },
        { role: "Outreach Coordinator", company: "Youth Forward", dates: "2012 - 2017", description: "Organized after-school mentorship programs for at-risk youth. Planned annual fundraising galas that exceeded revenue targets by 25%." }
      ],
      education: "M.A. Nonprofit Management, UT Austin (2012)\nB.A. Sociology (2010)"
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (index, field, value, arrayName) => { const newArray = [...data[arrayName]]; newArray[index][field] = value; setData(prev => ({ ...prev, [arrayName]: newArray })); };
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
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <span className="font-bold text-[#8B0000]">{templateConfig.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 ${generatedCvNumber
                ? "bg-slate-800 hover:bg-slate-900"
                : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              style={generatedCvNumber ? { backgroundColor: templateConfig.primaryColor } : {}}
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
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><Users size={20} /> Leadership Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Professional Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Work Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Base Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><Heart size={20} /> Mission Statement</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none bg-gray-50/50" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between mb-4 items-center font-bold text-[#8B0000]">
                <h3>Programmatic Experience</h3>
                <button onClick={addExperience} className="text-xs bg-[#8B0000] text-white px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity">+ Add Entry</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50/50 relative group border-dashed border-gray-300">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Organization" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><Globe size={20} /> Skills & Academic Background</h3>
              <InputGroup label="Capabilities (Comma separated)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Education" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar text-slate-900">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
              <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 30px' }}>
                <div style={{ borderBottom: `2px solid rgba(255,255,255,0.2)`, paddingBottom: '20px', marginBottom: '30px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>{data.firstName}<br />{data.lastName}</h1>
                  <p style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: templateConfig.accentColor }}>{data.title}</p>
                </div>
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', marginBottom: '15px' }}>Contact Info</h3>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>{data.phone}</div>
                    <div>{data.email}</div>
                    <div>{data.location}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', marginBottom: '15px' }}>Core Skills</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.skills.split(',').map((skill, i) => (
                      <div key={i} style={{ fontSize: '12px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{skill.trim()}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', marginBottom: '15px' }}>Education</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{data.education}</p>
                </div>
              </div>
              <div style={{ width: '65%', padding: '40px 45px' }}>
                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.accentColor }}></div> Mission Statement
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                </section>
                <section>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.accentColor }}></div> Relevant Experience
                  </h3>
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '30px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>{exp.company}</span>
                        <span style={{ fontSize: '12px', backgroundColor: templateConfig.accentColor, color: '#333', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{exp.dates}</span>
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                    </div>
                  ))}
                </section>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  SEQ ID: {generatedCvNumber} • IMPACT-V3
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 text-slate-900 text-center">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl border-t-8 border-[#8B0000]">
            <h3 className="text-2xl font-bold mb-2">Impact Recorded</h3>
            <p className="text-sm text-gray-600 mb-4 italic underline decoration-[#8B0000]/20 underline-offset-4 tracking-wide">Your profile has been validated and synced with the Nonprofit Leadership Registry.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-2xl mb-6 shadow-inner">
              <div className="flex justify-center mb-2 text-[#8B0000]"><ShieldCheck size={32} /></div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1 font-sans">Archive ID</p>
              <p className="text-3xl font-black text-[#8B0000] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-[0.98]" style={{ backgroundColor: templateConfig.primaryColor }}>Return to Builder</button>
          </div>
        </div>
      )}
    </div>
  );
}