import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, BookOpen, GraduationCap, Award, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81]" />
  </div>
);

export default function AcademicDirectorExpertTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Academic Director Expert",
    primaryColor: "#312e81",
    accentColor: "#eef2ff",
    defaultData: {
      firstName: "Margaret",
      lastName: "Hastings",
      title: "Director of Academic Affairs",
      email: "m.hastings@university.edu",
      phone: "+1 555 456 7890",
      location: "Chicago, IL",
      summary: "Visionary Academic Director with 12 years of experience in higher education administration. Proven ability to design innovative curricula, manage multi-million dollar department budgets, and foster an inclusive environment that drives student retention and faculty excellence.",
      skills: "Curriculum Development, Accreditation Compliance, Faculty Mentorship, Budget Administration, Strategic Planning, Higher Ed Policy",
      experience: [
        { role: "Director of Academic Affairs", company: "Northwestern University", dates: "2018 - Present", description: "Spearheaded the redesign of the core undergraduate curriculum, improving student retention rates by 8%. Managed a $5M departmental budget and oversaw the successful reaccreditation process." },
        { role: "Department Chair, Humanities", company: "Loyola University", dates: "2010 - 2018", description: "Evaluated and recruited tenure-track faculty. Developed new interdisciplinary programs that increased department enrollment by 15%." }
      ],
      education: "Ed.D. Higher Education Administration, UPenn (2010)\nM.A. Literature (2005)"
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
            <button onClick={() => navigate('/templates')} className="inline-flex items-center text-sm font-medium hover:bg-gray-100 h-9 px-3 rounded-md text-gray-600 transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <span className="font-bold text-[#312e81] tracking-tight">{templateConfig.name}</span>
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
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#312e81]"><GraduationCap size={20} /> Faculty Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Academic Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Institutional Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Campus/Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#312e81]"><Award size={20} /> Executive Statement</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#312e81] outline-none bg-gray-50/50 leading-relaxed" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between mb-4 items-center font-bold text-[#312e81]">
                <h3 className="flex items-center gap-2"><BookOpen size={20} /> Academic Appointments</h3>
                <button onClick={addExperience} className="text-xs bg-[#312e81] text-white px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity uppercase tracking-tighter">+ Add Position</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50/50 relative group border-dashed border-gray-300">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Institution" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates of Appointment" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#312e81] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#312e81]">Pedagogy & Credentials</h3>
              <InputGroup label="Core Competencies (Comma separated)" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Academic Background" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div
              id="resume-preview"
              ref={previewRef}
              style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

              <div style={{ backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 50px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{data.firstName} {data.lastName}</h1>
                <h2 style={{ fontSize: '16px', color: templateConfig.accentColor, fontWeight: 'normal', letterSpacing: '1px', textTransform: 'uppercase' }}>{data.title}</h2>
              </div>
              <div style={{ backgroundColor: templateConfig.accentColor, color: templateConfig.primaryColor, padding: '10px 50px', display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '12px', fontWeight: 'bold' }}>
                <span>{data.email}</span> <span>|</span> <span>{data.phone}</span> <span>|</span> <span>{data.location}</span>
              </div>
              <div style={{ padding: '40px 50px', flex: 1 }}>
                <section style={{ marginBottom: '35px' }}>
                  <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333', textAlign: 'justify' }}>{data.summary}</p>
                </section>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                  <section>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '5px', marginBottom: '20px' }}>Administrative Experience</h3>
                    {data.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: '0 0 2px 0' }}>{exp.role}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{exp.company}</span>
                          <span style={{ fontSize: '11px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.dates}</span>
                        </div>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                      </div>
                    ))}
                  </section>
                  <div>
                    <section style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Competencies</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {data.skills.split(',').map((skill, i) => (
                          <span key={i} style={{ fontSize: '11px', color: templateConfig.primaryColor, backgroundColor: templateConfig.accentColor, padding: '4px 8px', borderRadius: '3px', fontWeight: '600' }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: `2px solid ${templateConfig.accentColor}`, paddingBottom: '5px', marginBottom: '15px' }}>Education</h3>
                      <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-line' }}>{data.education}</p>
                    </section>
                  </div>
                </div>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '40px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  REF-ID: {generatedCvNumber} • ACADEMIC REGISTRY
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 text-slate-900 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border-t-8 border-[#312e81]">
            <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase">Dossier Archived</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic">Your credentials have been successfully validated and synced with the university database.</p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-xl mb-6">
              <div className="flex justify-center mb-2 text-[#312e81]"><ShieldCheck size={32} /></div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1">Registry ID</p>
              <p className="text-3xl font-black text-[#312e81] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3.5 rounded-lg text-white font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>Acknowledge</button>
          </div>
        </div>
      )}
    </div>
  );
}