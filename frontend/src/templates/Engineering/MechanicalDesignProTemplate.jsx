import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Plus, Trash2, Loader2, Settings, PenTool, Database, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full rounded-none border-b border-slate-300 bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-orange-500 transition-colors font-mono" 
    />
  </div>
);

export default function MechanicalDesignProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();
  
  const templateConfig = {
    name: "Mechanical Design Pro",
    primaryColor: "#2D3436", // Industrial Charcoal
    accentColor: "#E67E22",  // Engineering Orange
    defaultData: {
      firstName: "Clara",
      lastName: "Hughes",
      title: "Mechanical Design Engineer",
      email: "c.hughes@mechdesign.com",
      phone: "+1 555 111 2222",
      location: "Detroit, MI",
      summary: "Detail-oriented Mechanical Design Engineer specializing in CAD/CAM and product development. Proven ability to take complex hardware from conceptual design through prototyping, testing, and full-scale manufacturing.",
      skills: "SolidWorks, AutoCAD Mechanical, ANSYS (FEA), GD&T, Rapid Prototyping, DFMA",
      experience: [
        { role: "Senior Mechanical Engineer", company: "AutoParts Innovation", dates: "2019 - Present", description: "Designed and optimized a new drivetrain component, reducing overall weight by 18% without sacrificing structural integrity. Generated complete GD&T drawings for manufacturing." },
        { role: "Product Design Engineer", company: "TechGear Hardware", dates: "2015 - 2019", description: "Utilized SolidWorks to design consumer electronic enclosures. Conducted thermal and stress simulations to ensure product longevity." }
      ],
      education: "B.S. in Mechanical Engineering, University of Michigan (2015)"
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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* WORKSTATION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 shrink-0 w-full z-10">
        <div className="bg-white border border-slate-300 shadow-sm rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/templates')} className="inline-flex items-center text-xs font-bold hover:bg-slate-50 h-8 px-3 rounded border border-slate-200 text-slate-500 uppercase tracking-tighter transition-all"><ArrowLeft className="w-3 h-3 mr-2" /> EXIT_WORKSTATION</button>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400 animate-spin-slow" />
                  <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-widest">{templateConfig.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center text-xs font-bold h-8 px-4 rounded bg-slate-800 text-white hover:bg-slate-700 transition-colors uppercase"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Database className="w-3 h-3 mr-2" />
                )}

                {generatedCvNumber || cvNumber ? "Update_Data" : "Save_Data"}
              </button>
              <button
                onClick={() => handlePdfDownload(generatedCvNumber)}
                disabled={!generatedCvNumber}
                className={`inline-flex items-center text-xs font-bold h-8 px-4 rounded text-white shadow-md hover:brightness-110 transition-all uppercase ${generatedCvNumber
                  ? "bg-orange-600"
                  : "bg-slate-300 cursor-not-allowed opacity-70"
                  }`}
              >
                <Download className="w-3 h-3 mr-2" /> Export_DWG
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 w-full overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
            
            {/* DESIGN INPUTS */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-300">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-[0.2em] border-b pb-2"><PenTool className="w-4 h-4" /> Global_Parameters</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="System_First_Name" value={data.firstName} onChange={(v)=>handleInputChange('firstName', v)}/>
                        <InputGroup label="System_Last_Name" value={data.lastName} onChange={(v)=>handleInputChange('lastName', v)}/>
                        <InputGroup label="Engineering_Designation" value={data.title} onChange={(v)=>handleInputChange('title', v)} className="col-span-2"/>
                        <InputGroup label="Network_Email" value={data.email} onChange={(v)=>handleInputChange('email', v)}/>
                        <InputGroup label="Comm_Link" value={data.phone} onChange={(v)=>handleInputChange('phone', v)}/>
                        <InputGroup label="Base_Station" value={data.location} onChange={(v)=>handleInputChange('location', v)} className="col-span-2"/>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-300">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-slate-800">Design_Scope</h3>
                    <textarea rows={4} value={data.summary} onChange={(e)=>handleInputChange('summary', e.target.value)} className="w-full border border-slate-200 rounded-none p-3 text-sm focus:border-orange-500 outline-none leading-relaxed bg-slate-50 font-mono italic"/>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-300">
                     <div className="flex justify-between mb-4"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Operational_Timeline</h3><button onClick={addExperience} className="text-[10px] text-orange-600 font-black hover:underline uppercase tracking-tighter">+ New_Phase</button></div>
                     {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4 p-4 border-l-2 border-orange-500 bg-slate-50 relative group">
                            <button onClick={()=>removeExperience(i)} className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Role_ID" value={exp.role} onChange={(v)=>handleArrayChange(i,'role',v,'experience')}/>
                                <InputGroup label="Corporation" value={exp.company} onChange={(v)=>handleArrayChange(i,'company',v,'experience')}/>
                                <InputGroup label="Phase_Duration" value={exp.dates} onChange={(v)=>handleArrayChange(i,'dates',v,'experience')} className="col-span-2"/>
                                <textarea rows={3} placeholder="Define outputs, CAD mastery, and FEA results..." value={exp.description} onChange={(e)=>handleArrayChange(i,'description',e.target.value,'experience')} className="col-span-2 border border-slate-200 rounded-none p-2 text-sm font-mono focus:border-orange-500 outline-none"/>
                            </div>
                        </div>
                     ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-300">
                    <h3 className="text-xs font-black mb-4 uppercase tracking-[0.2em] text-slate-800">Technical_Specifications</h3>
                    <InputGroup label="Core_Competencies" value={data.skills} onChange={(v)=>handleInputChange('skills', v)}/>
                    <div className="h-6"></div>
                    <InputGroup label="Credentials_&_Certifications" value={data.education} onChange={(v)=>handleInputChange('education', v)}/>
                </div>
            </div>

            {/* BLUEPRINT PREVIEW */}
            <div className="h-full bg-slate-400 rounded-lg overflow-auto flex justify-center p-8 custom-scrollbar">
                <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '15mm', boxShadow: 'inset 0 0 0 1px #2d3436, 0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative' }}>
                    
                    <div style={{ border: '0.5pt solid #2d3436', height: '100%', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                        
                        <div style={{ borderBottom: '2px solid #2d3436', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#e67e22', marginBottom: '5px', letterSpacing: '2px' }}>[ PART_NAME ]</div>
                                <h1 style={{ fontSize: '38px', fontFamily: 'monospace', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0, lineHeight: '0.9' }}>
                                    {data.firstName}<br/>{data.lastName}
                                </h1>
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', borderLeft: '1.5pt solid #2d3436', paddingLeft: '20px' }}>
                                <div style={{ fontWeight: 'bold', color: '#e67e22', marginBottom: '10px', fontSize: '12px' }}>{data.title}</div>
                                <div style={{ opacity: 0.7 }}>EMAIL: {data.email}</div>
                                <div style={{ opacity: 0.7 }}>TEL: {data.phone}</div>
                                <div style={{ opacity: 0.7 }}>LOC: {data.location}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: '9px', fontWeight: '900', color: '#2d3436', marginBottom: '8px', letterSpacing: '1.5px' }}>// PROJECT_SUMMARY_SPEC:</div>
                            <p style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#334155', margin: 0, fontFamily: 'monospace' }}>{data.summary}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
                            <div style={{ flex: 1.8 }}>
                                <h3 style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '900', color: '#fff', backgroundColor: '#2d3436', padding: '4px 10px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '2px' }}>
                                    Operational_History
                                </h3>
                                {data.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '30px', position: 'relative', paddingLeft: '20px', borderLeft: '1px solid #e2e8f0' }}>
                                        <div style={{ position: 'absolute', width: '6px', height: '6px', backgroundColor: '#e67e22', left: '-3.5px', top: '6px' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#111', textTransform: 'uppercase' }}>{exp.role}</h4>
                                            <span style={{ fontSize: '11px', color: '#e67e22', fontWeight: 'bold' }}>[{exp.dates}]</span>
                                        </div>
                                        <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' }}>ORG: {exp.company}</div>
                                        <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155', margin: 0, fontFamily: 'monospace' }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '35px' }}>
                                    <h3 style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '900', color: '#2d3436', textTransform: 'uppercase', borderBottom: '1.5pt solid #2d3436', paddingBottom: '5px', marginBottom: '15px', letterSpacing: '1px' }}>
                                        Technical_Specs
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {data.skills.split(',').map((skill, i) => (
                                            <div key={i} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#e67e22', fontWeight: 'bold' }}>&#187;</span> {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '900', color: '#2d3436', textTransform: 'uppercase', borderBottom: '1.5pt solid #2d3436', paddingBottom: '5px', marginBottom: '15px', letterSpacing: '1px' }}>
                                        Credentials
                                    </h3>
                                    <p style={{ fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line', margin: 0 }}>{data.education}</p>
                                </div>
                            </div>
                        </div>

                        {/* Title Block Footer */}
                        <div style={{ marginTop: '30px', borderTop: '1px solid #2d3436', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'monospace', fontSize: '8px', color: '#94a3b8' }}>
                            <div>REV_01 // DWG_NO: {generatedCvNumber || "PENDING"}</div>
                            <div>VERIFIED BY RESUMEA_ENGINEERING</div>
                            <div>SHEET 1 OF 1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>



      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md px-4">
          <div className="w-full max-w-sm rounded border-2 border-orange-500 bg-white p-8 shadow-2xl">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-none flex items-center justify-center mx-auto mb-6 border border-orange-200 shadow-inner">
              <Settings className="w-10 h-10 animate-spin-slow" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-[0.2em] text-center italic">Blueprint_Secured</h3>
            <p className="text-[10px] font-mono text-slate-500 mb-8 uppercase tracking-tighter text-center leading-relaxed">
              Technical record successfully serialized into project database. Drawing ID confirmed.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-none mb-8 font-mono shadow-inner">
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.3em] mb-2 text-center">Serialized_DWG_ID</p>
              <p className="text-2xl font-black text-slate-900 tracking-widest text-center">{generatedCvNumber}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-orange-700 transition-all active:scale-95"
            >
              Exit_to_Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}