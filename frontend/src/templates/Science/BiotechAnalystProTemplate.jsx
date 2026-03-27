import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Beaker, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]" />
  </div>
);

export default function BiotechAnalystProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Biotech Analyst Pro",
    primaryColor: "#008080",
    accentColor: "#FFFFFF",
    defaultData: {
      firstName: "Elias",
      lastName: "Vance",
      title: "Senior Bioinformatics Analyst",
      email: "e.vance@biotech.com",
      phone: "+1 555 111 2222",
      location: "San Francisco, CA",
      summary: "Analytical Bioinformatics specialist focused on genomic data interpretation and predictive modeling. Adept at translating massive biological datasets into actionable pharmacological targets using Python, R, and advanced machine learning algorithms.",
      skills: "Python, R, Next-Generation Sequencing (NGS), Statistical Modeling, Data Visualization (Tableau), Machine Learning, Molecular Biology",
      experience: [
        { role: "Bioinformatics Analyst", company: "GenePharma Inc.", dates: "2019 - Present", description: "Developed custom Python pipelines to process NGS data, reducing analysis time by 40%. Collaborated with wet-lab scientists to identify 3 novel drug targets for oncology." },
        { role: "Data Analyst", company: "University Genomics Center", dates: "2016 - 2019", description: "Maintained and queried massive PostgreSQL genomic databases. Authored data reports for NIH grant proposals." }
      ],
      education: "M.S. Bioinformatics, Stanford University (2016)\nB.S. Computational Biology (2014)"
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
            <span className="font-bold text-[#008080]">{templateConfig.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all text-xs font-black uppercase tracking-widest"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2 text-[#008080]" />
              )}
              {generatedCvNumber || cvNumber ? "Update" : "Save"}
            </button>
            <button
              onClick={() => handlePdfDownload(generatedCvNumber)}
              disabled={!generatedCvNumber}
              className={`inline-flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md transition-all active:scale-95 text-xs font-black uppercase tracking-widest ${generatedCvNumber
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
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#008080]"><Beaker size={20} /> Researcher Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Scientific Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Base Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Scientific Abstract</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-[#008080] outline-none bg-gray-50/50" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between mb-4 items-center font-bold text-[#008080]">
                <h3>Clinical & Research History</h3>
                <button onClick={addExperience} className="text-xs bg-[#008080] text-white px-3 py-1 rounded hover:opacity-80 transition-opacity">+ Add Position</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group border-dashed border-gray-300">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Organization" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Duration" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#008080] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#008080]"><Database size={20} /> Technical Stack & Education</h3>
              <InputGroup label="Analysis Tools (Comma separated)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Academic Credentials" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: templateConfig.accentColor, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ height: '8px', backgroundColor: templateConfig.primaryColor, width: '100%' }}></div>

              <div style={{ padding: '40px 50px 20px', borderBottom: '1px solid #E5E7EB' }}>
                <h1 style={{ fontSize: '38px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{data.firstName} {data.lastName}</h1>
                <h2 style={{ fontSize: '15px', color: '#555', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>{data.title}</h2>
                <div style={{ display: 'flex', gap: '25px', marginTop: '15px', fontSize: '11px', color: '#666', fontWeight: '600' }}>
                  <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
                </div>
              </div>

              <div style={{ padding: '30px 50px', flex: 1 }}>
                <section style={{ marginBottom: '35px' }}>
                  <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>{data.summary}</p>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                  <section>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '20px' }}>Clinical Experience</h3>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: '0 0 2px 0' }}>{exp.role}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{exp.company}</span>
                          <span style={{ fontSize: '11px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                        </div>
                        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                      </div>
                    ))}
                  </section>

                  <div>
                    <section style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Analysis Stack</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {data.skills.split(',').map((skill, i) => (
                          <span key={i} style={{ fontSize: '10px', color: '#111', border: `1px solid ${templateConfig.primaryColor}`, padding: '4px 8px', borderRadius: '3px', fontWeight: '700' }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.primaryColor}`, paddingBottom: '4px', marginBottom: '15px' }}>Credentials</h3>
                      <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                    </section>
                  </div>
                </div>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  SEQ ID: {generatedCvNumber} • BIO-ARCHIVE-V4
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4 text-slate-900 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-[#008080]">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-teal-100">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight italic">Protocol Complete</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">The scientific profile has been validated and synced with the global scientific repository.</p>
            <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl mb-8 shadow-inner">
              <p className="text-[10px] text-teal-500 uppercase font-black tracking-[0.3em] mb-2">Validation ID</p>
              <p className="text-3xl font-black text-teal-400 font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all active:scale-95" style={{ backgroundColor: templateConfig.primaryColor }}>Acknowledge Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
}