import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

import { 
  ArrowLeft, Save, Download, Plus, Trash2, Loader2, 
  Mail, Phone, MapPin, Microscope, FileText, Fingerprint, Award 
} from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-[0.2em]">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full border-b border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-[#312e81] transition-colors" 
    />
  </div>
);

export default function SeniorResearcherPortfolioTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Senior Researcher Portfolio",
    primaryColor: "#312e81", 
    accentColor: "#eef2ff",  
    defaultData: {
      firstName: "Dr. Arthur",
      lastName: "Pendelton",
      title: "Senior Research Fellow",
      email: "a.pendelton@institute.edu",
      phone: "+1 555 202 3030",
      location: "Boston, MA",
      summary: "Senior Researcher with over 15 years of experience in cognitive neuroscience. Lead investigator on 4 NIH-funded grants totaling $2.5M. Proven track record of publishing in high-impact journals and mentoring post-doctoral candidates.",
      skills: "Cognitive Neuroscience, fMRI Data Analysis, Grant Writing, MATLAB, Python, Cross-functional Collaboration, Research Methodology",
      experience: [
        { role: "Senior Research Fellow", company: "Boston Neuroscience Institute", dates: "2016 - Present", description: "Direct a lab of 12 researchers investigating neuroplasticity. Published 6 first-author papers in Tier 1 journals. Secured a $1.2M multi-year federal grant." },
        { role: "Postdoctoral Researcher", company: "University of Cambridge", dates: "2011 - 2016", description: "Conducted behavioral assays and fMRI analyses. Collaborated with international teams to standardise brain-imaging protocols." }
      ],
      education: "Ph.D. in Neuroscience, Stanford University (2011)\nB.S. Biology, Yale University (2005)"
    }
  };

  const [data, setData] = useState(initialData || templateConfig.defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [generatedCvNumber, setGeneratedCvNumber] = useState(cvNumber || "");

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
        setShowSyncModal(true);
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      
      {/* HEADER TOOLBAR */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#312e81] p-1.5 rounded shadow-lg">
              <Microscope size={18} className="text-white"/>
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight">Portfolio Engine <span className="text-slate-300 ml-2 font-normal">| {templateConfig.name}</span></h2>
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
            <Download className="mr-2" /> PDF
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* EDITOR SECTION */}
        <div className="w-1/2 overflow-y-auto p-12 custom-scrollbar border-r border-slate-100 bg-white">
          <div className="max-w-xl mx-auto space-y-12">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Fingerprint size={14}/> Identity & Location
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                <InputGroup label="Official Designation" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                <InputGroup label="Institute Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                <InputGroup label="Direct Line" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                <InputGroup label="Laboratory Base" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <FileText size={14}/> Research Abstract
              </h3>
              <textarea 
                rows={5} 
                value={data.summary} 
                onChange={(e)=>handleInputChange('summary', e.target.value)} 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm leading-relaxed text-slate-600 italic focus:outline-none focus:ring-2 focus:ring-[#312e81]/10 transition-all"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Institutional History</h3>
                <button onClick={addExperience} className="text-[10px] font-bold bg-[#312e81] text-white px-3 py-1.5 rounded uppercase hover:opacity-90">+ Add Post</button>
              </div>
              <div className="space-y-6">
                {data.experience.map((exp, i) => (
                  <div key={i} className="p-6 border border-slate-100 rounded-2xl relative group bg-white shadow-sm">
                    <button onClick={()=>removeExperience(i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Rank" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                      <InputGroup label="Organization" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                      <InputGroup label="Tenure Dates" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                      <textarea rows={3} value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 text-sm border-b border-slate-100 p-2 focus:outline-none focus:border-[#312e81]"/>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="w-1/2 bg-slate-200 overflow-y-auto flex justify-center p-12 custom-scrollbar">
          <div 
            id="resume-preview"
            ref={previewRef} 
            style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }}>

            
            {/* Indigo Command Column */}
            <div style={{ width: '38%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '50px 35px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1', marginBottom: '15px', letterSpacing: '-1px' }}>{data.firstName}<br/>{data.lastName}</h1>
                <div style={{ width: '40px', height: '4px', backgroundColor: '#6366f1', marginBottom: '15px' }}></div>
                <p style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.title}</p>
              </div>

              <div style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', marginBottom: '20px', letterSpacing: '2px' }}>Communication</h3>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '14px', color: '#e0e7ff' }}>
                  <div className="flex items-center gap-3"><Phone size={12} className="text-[#6366f1]"/> {data.phone}</div>
                  <div className="flex items-center gap-3 underline underline-offset-4"><Mail size={12} className="text-[#6366f1]"/> {data.email}</div>
                  <div className="flex items-center gap-3"><MapPin size={12} className="text-[#6366f1]"/> {data.location}</div>
                </div>
              </div>

              <div style={{ marginBottom: '45px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', marginBottom: '20px', letterSpacing: '2px' }}>Domain Expertise</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.skills.split(',').map((skill, i) => (
                    <div key={i} style={{ fontSize: '11.5px', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', borderLeft: '3px solid #6366f1' }}>{skill.trim()}</div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', marginBottom: '20px', letterSpacing: '2px' }}>Academic Pedigree</h3>
                <p style={{ fontSize: '11.5px', lineHeight: '1.7', whiteSpace: 'pre-line', color: '#e0e7ff' }}>{data.education}</p>
              </div>
            </div>

            {/* Content Column */}
            <div style={{ width: '62%', padding: '60px 50px' }}>
              <section style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Research Abstract</h3>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#f1f5f9' }}></div>
                </div>
                <p style={{ fontSize: '13.5px', lineHeight: '1.8', color: '#475569', textAlign: 'justify', fontStyle: 'italic' }}>"{data.summary}"</p>
              </section>

              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Institutional History</h3>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#f1f5f9' }}></div>
                </div>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '35px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #f1f5f9' }}>
                    <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: templateConfig.primaryColor }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{exp.role}</h4>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: templateConfig.primaryColor, backgroundColor: templateConfig.accentColor, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#6366f1', fontWeight: '700', marginBottom: '12px' }}>{exp.company}</div>
                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#64748b', margin: 0 }}>{exp.description}</p>
                  </div>
                ))}
              </section>
            </div>

            {/* SCHOLAR VERIFICATION BAR */}
            {(generatedCvNumber || cvNumber) && (
              <div style={{ position: 'absolute', bottom: '40px', left: '38%', width: '62%', padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8', fontFamily: 'monospace' }}>SECURE_ARCHIVE_ID: {generatedCvNumber || cvNumber}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SYNC SUCCESS MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl border border-slate-100">
            <div className="w-24 h-24 bg-indigo-50 text-[#312e81] rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform hover:rotate-0">
              <Award size={56}/>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">PORTFOLIO ARCHIVED</h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium px-4">Your senior research portfolio has been encrypted and synced with the institutional repository.</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100 flex items-center justify-between">
               <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Archive Reference</p>
                  <p className="text-2xl font-mono font-bold text-[#312e81]">{generatedCvNumber}</p>
               </div>
               <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <Fingerprint size={24} className="text-[#312e81]"/>
               </div>
            </div>

            <button onClick={() => setShowSyncModal(false)} className="w-full py-5 bg-[#312e81] text-white font-black rounded-2xl uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:translate-y-[-2px] transition-all">Continue to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}