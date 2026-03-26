import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, ShieldCheck, ClipboardCheck, FileText, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium" 
    />
  </div>
);

export default function AuditorProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Auditor Pro",
    primaryColor: "#065f46", // Deep Emerald
    accentColor: "#fbbf24",  // Amber
    defaultData: {
      firstName: "Michael",
      lastName: "O'Keefe",
      title: "Senior Internal Auditor",
      email: "michael.audit@example.com",
      phone: "+1 555 789 0000",
      location: "Chicago, IL",
      summary: "Certified Internal Auditor (CIA) with 9 years of experience in risk assessment, SOX compliance, and operational audits. Dedicated to enhancing internal controls, streamlining business processes, and ensuring regulatory integrity.",
      skills: "Internal Controls, SOX Compliance, Risk Management, Data Analytics (ACL, IDEA), Fraud Investigation, ERP Systems",
      experience: [
        { role: "Senior Internal Auditor", company: "Midwest Financial Group", dates: "2018 - Present", description: "Lead comprehensive operational and financial audits. Identified process inefficiencies, recommending controls that saved $1.2M annually." },
        { role: "Staff Auditor", company: "Grant Thornton", dates: "2014 - 2018", description: "Executed compliance audits for manufacturing clients. Drafted detailed audit reports for executive management." }
      ],
      education: "B.S. in Accounting, DePaul University (2014)\nCertified Internal Auditor (CIA)"
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* COMPLIANCE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/templates')} className="text-xs font-bold hover:bg-slate-100 h-9 px-4 uppercase border border-slate-200 rounded transition-all flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Templates
                </button>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm uppercase tracking-wider">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-bold h-9 px-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all uppercase flex items-center"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="mr-2" />
                )}

                {generatedCvNumber || cvNumber ? "Update_Draft" : "Save_Draft"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`text-xs font-bold h-9 px-6 rounded bg-slate-900 text-white hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center ${generatedCvNumber
                  ? "opacity-100"
                  : "opacity-50 cursor-not-allowed"
                  }`}
              >
                <Download className="w-4 h-4 mr-2" /> Finalize_PDF
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full mt-4">
            
            {/* AUDIT INPUTS */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-slate-900 uppercase tracking-widest border-b pb-2"><FileText className="w-4 h-4" /> Personnel File</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="First Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="Last Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Corporate Title" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Secure Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Direct Extension" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Hiring Region" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Executive Summary</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full bg-slate-50 p-3 rounded border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none mt-2"/>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Audit & Experience Log</h3>
                        <button onClick={addExperience} className="text-[10px] bg-emerald-600 text-white px-2 py-1 font-bold rounded uppercase">+ Add Entry</button>
                     </div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border rounded bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Designation" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Entity/Firm" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Audit Period" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Describe scope, key findings, and process improvements..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border rounded p-2 text-sm mt-1 outline-none focus:border-emerald-600"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-slate-900 border-b pb-2">Technical Proficiencies</h3>
                    <InputGroup label="Audit Methodology & Tools" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Education & Certifications" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* AUDIT REPORT PREVIEW */}
            <div className="h-full bg-slate-300 flex justify-center p-8 overflow-auto custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ padding: '50px', backgroundColor: '#fcfcfc', borderTop: `10px solid ${templateConfig.primaryColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1', margin: '0 0 10px 0' }}>{data.firstName} {data.lastName}</h1>
                            <div style={{ fontSize: '14px', color: templateConfig.primaryColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClipboardCheck size={18} /> {data.title}
                            </div>
                        </div>
                        <div style={{ borderLeft: `3px solid ${templateConfig.accentColor}`, paddingLeft: '20px', fontSize: '11px', color: '#444', fontWeight: '600', lineHeight: '1.8' }}>
                            <div>{data.email}</div>
                            <div>{data.phone}</div>
                            <div>{data.location}</div>
                        </div>
                    </div>

                    <div style={{ padding: '0 50px 50px', flex: 1 }}>
                        
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                I. Executive Summary
                            </h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333', margin: 0 }}>{data.summary}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0' }}>
                                II. Professional Engagement Log
                            </h3>
                            
                            <div style={{ borderTop: '2px solid #000', marginTop: '10px' }}>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ borderBottom: '1px solid #e2e8f0', padding: '25px 0', display: 'flex' }}>
                                        <div style={{ width: '30%', paddingRight: '20px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase' }}>{exp.company}</div>
                                            <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginTop: '5px' }}>{exp.dates}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: templateConfig.primaryColor, margin: '0 0 10px 0', textTransform: 'uppercase' }}>{exp.role}</h4>
                                            <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                    III. Scope of Expertise
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.skills.split(',').map((skill, i) => (
                                        <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#111', border: '1px solid #ccc', padding: '4px 10px', backgroundColor: '#f8fafc' }}>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: '900', color: 'white', backgroundColor: templateConfig.primaryColor, display: 'inline-block', padding: '5px 15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                                    IV. Credentials
                                </h3>
                                <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#333', whiteSpace: 'pre-line', fontWeight: '600' }}>{data.education}</p>
                            </div>
                        </div>

                        {generatedCvNumber && (
                            <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right' }}>
                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    Verified Audit Manifest: #{generatedCvNumber}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 text-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border-t-8 border-emerald-600">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Manifest Verified</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-emerald-600/30 underline-offset-4 tracking-wide">
              Compliance standards met. Operational audit documentation successfully archived.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 font-mono text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Audit Serial ID</p>
              <p className="text-3xl font-black text-emerald-700 tracking-tighter">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 text-xs"
            >
              Back to Station
            </button>
          </div>
        </div>
      )}
    </div>
  );
}