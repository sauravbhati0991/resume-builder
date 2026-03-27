import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Zap, Mail, Phone, MapPin, Cpu, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tight">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
    />
  </div>
);

export default function ElectricalSystemsProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Electrical Systems Pro",
    primaryColor: "#334155", // Slate Steel
    accentColor: "#F59E0B",  // High-Voltage Amber
    defaultData: {
      firstName: "Marcus",
      lastName: "Trent",
      title: "Electrical Systems Engineer",
      email: "m.trent@electro.com",
      phone: "+1 555 987 6543",
      location: "Austin, TX",
      summary: "Innovative Electrical Engineer with deep expertise in power distribution systems and PLC programming. Adept at designing low and medium voltage architectures that maximize energy efficiency and comply with NEC standards.",
      skills: "AutoCAD Electrical, PLC Programming, Power Systems Analysis, PCB Design, SCADA Systems, MATLAB",
      experience: [
        { role: "Electrical Engineer", company: "Volt Power Solutions", dates: "2020 - Present", description: "Designed medium-voltage distribution systems for commercial data centers. Programmed and commissioned PLC architectures, improving system automation reliability by 25%." },
        { role: "Junior Controls Engineer", company: "Industrial Automation Inc.", dates: "2016 - 2020", description: "Assisted in the design of motor control centers (MCCs) and HMI interfaces for manufacturing plants." }
      ],
      education: "B.S. in Electrical Engineering, Texas A&M (2016)"
    }
  };

  // MASTER PATTERN STATE
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800">

      {/* COMMAND BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-semibold hover:bg-slate-50 h-9 px-3 rounded-md text-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Templates</button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-slate-400" />
              <span className="font-bold text-slate-700 uppercase tracking-tight">{templateConfig.name}</span>
            </div>
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

          {/* SCHEMATIC EDITOR */}
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-widest"><Zap className="w-4 h-4 text-amber-500" /> System Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Engineer Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-700">Executive Brief</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-slate-500 outline-none leading-relaxed bg-slate-50 font-mono" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex justify-between mb-4"><h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Project History</h3><button onClick={addExperience} className="text-xs text-blue-600 font-bold hover:underline">+ Add Project</button></div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Organization" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Timeline" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} placeholder="Quantify impact (e.g., voltage improved, efficiency gained...)" onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-700">Tech Stack & Pedigree</h3>
              <InputGroup label="Technical Skills (Comma separated)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Academic History" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* BLUEPRINT PREVIEW */}
          <div className="h-full bg-slate-300/50 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>

              {/* Dark Steel Sidebar */}
              <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '45px 30px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                  <Zap size={56} color={templateConfig.accentColor} strokeWidth={2.5} />
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px', lineHeight: '1.1' }}>{data.firstName}<br />{data.lastName}</h1>
                <h2 style={{ fontSize: '11px', color: templateConfig.accentColor, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '45px' }}>{data.title}</h2>

                <div style={{ marginBottom: '45px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Point of Contact</h3>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={14} color={templateConfig.accentColor} /> <span style={{ wordBreak: 'break-all' }}>{data.email}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={14} color={templateConfig.accentColor} /> {data.phone}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={14} color={templateConfig.accentColor} /> {data.location}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '45px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Technical Stack</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.skills.split(',').map((skill, i) => (
                      <div key={i} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                        <div style={{ width: '8px', height: '2px', backgroundColor: templateConfig.accentColor }}></div>
                        {skill.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '900', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '8px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Pedigree</h3>
                  <p style={{ fontSize: '11px', lineHeight: '1.7', opacity: 0.9, whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                </div>
              </div>

              {/* Schematic Main Content */}
              <div style={{ width: '65%', padding: '50px' }}>

                <section style={{ marginBottom: '45px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Executive Brief</h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.75', color: '#334155', margin: 0 }}>{data.summary}</p>
                </section>

                <section>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>Project History & Career Path</h3>
                  <div style={{ position: 'relative', borderLeft: `2px solid #e2e8f0`, paddingLeft: '30px', marginLeft: '6px' }}>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: '35px', position: 'relative' }}>
                        <div style={{ position: 'absolute', width: '14px', height: '14px', backgroundColor: 'white', border: `3px solid ${templateConfig.accentColor}`, borderRadius: '50%', left: '-38px', top: '4px', zIndex: 1 }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{exp.dates}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: templateConfig.accentColor, marginBottom: '12px', textTransform: 'uppercase' }}>{exp.company}</div>
                        <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#475569', margin: 0 }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* System Verification Footer */}
              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '30px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  SYSTEM_VER_ID: {generatedCvNumber} • {new Date().getFullYear()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md px-4 text-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border-t-8 border-amber-500">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">System Verified</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-amber-500/30 underline-offset-4 tracking-wide">
              Engineering records successfully archived and verified.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 text-center">Diagnostic ID</p>
              <p className="text-3xl font-black text-amber-600 tracking-tighter text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
            >
              Back to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}