import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Mail, Phone, MapPin, Landmark, FileText, BarChart3, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]" />
  </div>
);

export default function PolicyAnalystModernTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Policy Analyst Modern",
    primaryColor: "#8B0000",
    accentColor: "#D3D3D3",
    defaultData: {
      firstName: "Daniel",
      lastName: "Hayes",
      title: "Senior Policy Analyst",
      email: "d.hayes@policy.gov",
      phone: "+1 555 123 4567",
      location: "Washington, DC",
      summary: "Analytical and detail-oriented Policy Analyst with 7 years of experience evaluating legislative proposals and drafting impact reports for local and state governments. Passionate about affordable housing initiatives and data-driven civic planning.",
      skills: "Legislative Research, Policy Drafting, Data Analysis (SPSS/R), Public Speaking, Stakeholder Engagement, Budget Forecasting, Urban Planning",
      experience: [
        { role: "Senior Policy Analyst", company: "Department of Housing", dates: "2019 - Present", description: "Drafted policy briefs that led to a $15M budget increase for affordable housing. Analyzed demographic data to forecast housing shortages in 3 major counties." },
        { role: "Research Assistant", company: "Urban Policy Institute", dates: "2015 - 2019", description: "Compiled public survey data and prepared graphical reports for city council meetings. Co-authored a published paper on transit-oriented development." }
      ],
      education: "Master of Public Policy (MPP), Georgetown University (2015)\nB.A. Political Science, American University (2013)"
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
            <span className="font-bold text-[#8B0000] tracking-tight uppercase text-xs">{templateConfig.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all text-slate-700"
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><Landmark size={20} /> Civic Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Official Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Jurisdiction/Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><FileText size={20} /> Legislative Summary</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none bg-gray-50/50" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between mb-4 items-center font-bold text-[#8B0000]">
                <h3>Professional Mandates</h3>
                <button onClick={addExperience} className="text-xs bg-[#8B0000] text-white px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity uppercase tracking-tighter">+ Add Position</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50/50 relative group border-dashed border-gray-300">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Agency/Institution" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Tenure" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#8B0000] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#8B0000]"><BarChart3 size={20} /> Methodologies & Education</h3>
              <InputGroup label="Core Competencies (Comma separated)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Academic Credentials" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar text-slate-900">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ backgroundColor: templateConfig.accentColor, padding: '40px 50px', borderTop: `8px solid ${templateConfig.primaryColor}`, borderBottom: '1px solid #ccc' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                <h2 style={{ fontSize: '18px', color: templateConfig.primaryColor, fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '12px', color: '#444', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color={templateConfig.primaryColor} /> {data.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color={templateConfig.primaryColor} /> {data.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color={templateConfig.primaryColor} /> {data.location}</span>
                </div>
              </div>
              <div style={{ padding: '40px 50px', flex: 1 }}>
                <section style={{ marginBottom: '35px' }}>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333', textAlign: 'justify' }}>{data.summary}</p>
                </section>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                  <section>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '20px' }}>Professional Experience</h3>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>{exp.role}</h4>
                          <span style={{ fontSize: '12px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#555', fontWeight: '600', marginBottom: '8px' }}>{exp.company}</div>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                      </div>
                    ))}
                  </section>
                  <div>
                    <section style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Competencies</h3>
                      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                        {data.skills.split(',').map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s.trim()}</li>)}
                      </ul>
                    </section>
                    <section>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Education</h3>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>{data.education}</p>
                    </section>
                  </div>
                </div>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  GOV-REF: {generatedCvNumber} • ARCHIVE-SECURE
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
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-slate-900">Record Validated</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic underline decoration-[#8B0000]/20 underline-offset-4 tracking-wide">Policy Analyst credentials have been successfully synced with the governmental registry.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-2xl mb-6 shadow-inner">
              <div className="flex justify-center mb-2 text-[#8B0000]"><ShieldCheck size={32} /></div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1 font-sans">Archive ID</p>
              <p className="text-3xl font-black text-[#8B0000] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-[0.98]" style={{ backgroundColor: templateConfig.primaryColor }}>Acknowledge Record</button>
          </div>
        </div>
      )}
    </div>
  );
}