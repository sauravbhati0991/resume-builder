import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

import {
  ArrowLeft, Save, Download, Plus, Trash2, Loader2,
  Mail, Phone, MapPin, Landmark, Book, ShieldCheck, GraduationCap
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81] transition-all font-serif"
    />
  </div>
);

export default function ResearchProfessorProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Research Professor Pro",
    primaryColor: "#312e81",
    accentColor: "#eef2ff",
    defaultData: {
      firstName: "Prof. Henry",
      lastName: "Adams",
      title: "Tenured Professor of Economics",
      email: "h.adams@university.edu",
      phone: "+1 555 888 9999",
      location: "New Haven, CT",
      summary: "Tenured Professor of Economics specializing in macro-economic theory and international trade. Author of 3 textbooks and over 40 peer-reviewed articles. Passionate educator dedicated to advancing graduate student research and securing institutional funding.",
      skills: "Macroeconomics, Econometrics, Stata, Academic Publishing, Curriculum Design, Grant Acquisition, Peer Review",
      experience: [
        { role: "Professor of Economics", company: "Yale University", dates: "2015 - Present", description: "Teach advanced graduate seminars in Econometrics. Serve on the university tenure review board. Secured a $500k grant from the NSF for international trade research." },
        { role: "Associate Professor", company: "Columbia University", dates: "2008 - 2015", description: "Published the highly cited textbook 'Modern Macroeconomic Theory'. Advised 12 Ph.D. candidates to successful dissertation defense." }
      ],
      education: "Ph.D. Economics, University of Chicago (2008)\nB.A. Mathematics, Princeton (2002)"
    }
  };

  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");
  const [zoom, setZoom] = useState(0.75);

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
    <div className="min-h-screen w-full bg-[#f1f5f9] flex flex-col overflow-hidden">

      {/* PROFESSIONAL TOP BAR */}
      <div className="w-full px-8 py-4 shrink-0 bg-white border-b border-slate-200 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/templates')} className="text-slate-400 hover:text-[#312e81] transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div className="flex items-center gap-3">
              <Landmark className="text-[#312e81]" size={24} />
              <span className="font-serif text-xl font-bold text-slate-800 tracking-tight">{templateConfig.name}</span>
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

      <div className="flex-1 flex overflow-hidden">
        {/* INPUT COLUMN */}
        <div className="w-1/2 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          <div className="max-w-xl mx-auto space-y-8 pb-32">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Academic Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Official Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone Number" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Institution Base" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Executive Summary</h3>
              <textarea rows={6} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border border-slate-100 rounded-lg p-4 text-sm focus:ring-1 focus:ring-[#312e81] outline-none bg-slate-50 font-serif leading-relaxed text-slate-700 italic" />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Appointments</h3>
                <button onClick={addExperience} className="text-[10px] font-bold bg-slate-800 text-white px-4 py-2 rounded uppercase tracking-widest hover:bg-[#312e81] transition-colors">+ New Entry</button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-8 p-6 border border-slate-100 rounded-lg relative group bg-slate-50/30">
                  <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="Academic Rank" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Institution" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates of Tenure" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={4} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border border-slate-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#312e81] font-serif" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="w-1/2 bg-slate-800 flex justify-center overflow-y-auto p-12 custom-scrollbar">
          <div
            id="resume-preview"
            ref={previewRef}
            style={{
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              fontFamily: '"Georgia", serif',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header with Professional Border */}
            <div style={{ padding: '60px 60px 30px', textAlign: 'center' }}>
              <div style={{ borderTop: `4px solid ${templateConfig.primaryColor}`, borderBottom: `1px solid ${templateConfig.primaryColor}`, padding: '30px 0' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
                  {data.firstName} {data.lastName}
                </h1>
                <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{data.title}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '12px', color: '#444', fontStyle: 'italic' }}>
                  <span className="flex items-center gap-1"><Mail size={12} /> {data.email}</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> {data.phone}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {data.location}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 70px 60px', flex: 1 }}>
              <section style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Academic Profile</h3>
                <p style={{ fontSize: '13px', lineHeight: '1.9', color: '#2d3748', textAlign: 'justify' }}>{data.summary}</p>
              </section>

              <section style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', letterSpacing: '1px' }}>Institutional Appointments</h3>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: 0 }}>{exp.company}</h4>
                      <span style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.role}</div>
                    <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#4a5568', margin: 0, textAlign: 'justify' }}>{exp.description}</p>
                  </div>
                ))}
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                <section>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Research Areas</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {data.skills.split(',').map((skill, i) => (
                      <span key={i} style={{ fontSize: '11px', color: '#2d3748', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', padding: '4px 8px', borderRadius: '4px' }}>{skill.trim()}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: templateConfig.primaryColor, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', letterSpacing: '1px' }}>Academic Background</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#2d3748', whiteSpace: 'pre-line', fontStyle: 'italic' }}>{data.education}</p>
                </section>
              </div>
            </div>

            {/* INSTITUTIONAL VERIFICATION FOOTER */}
            {generatedCvNumber && (
              <div style={{ padding: '20px 70px', borderTop: '1px solid #f1f5f9', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  <span>OFFICIAL ACADEMIC ARCHIVE</span>
                  <span>VERIFICATION ID: {generatedCvNumber}</span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-lg">
          <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center border-b-8 border-[#312e81] shadow-2xl">
            <div className="w-24 h-24 bg-indigo-50 text-[#312e81] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif tracking-tight">VERIFIED ACADEMIC RECORD</h3>
            <p className="text-sm text-slate-500 mb-8 italic">Profile synced with the Global Scholar Repository.</p>
            <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Repository Reference</p>
              <p className="text-3xl font-bold text-[#312e81] font-mono tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#312e81] text-white font-bold rounded-xl uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">Back to Workspace</button>
          </div>
        </div>
      )}
    </div>
  );
}