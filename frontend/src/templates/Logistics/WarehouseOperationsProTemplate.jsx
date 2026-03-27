import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, Layout, ShieldCheck, Box } from 'lucide-react';

const InputGroup = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#808000]" />
  </div>
);

export default function WarehouseOperationsProTemplate({
  saveAndGeneratePDF,
  initialData,
  cvNumber
}) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const previewRef = useRef();

  const templateConfig = {
    name: "Warehouse Operations Pro",
    primaryColor: "#808000",
    accentColor: "#FFD700",
    defaultData: {
      firstName: "Sarah",
      lastName: "Jenkins",
      title: "Warehouse Operations Manager",
      email: "s.jenkins@warehouse.com",
      phone: "+1 555 888 7777",
      location: "Dallas, TX",
      summary: "Highly organized Warehouse Operations Manager with 10 years of experience managing high-volume distribution centers. Expert in inventory control, OSHA compliance, and optimizing workflow to increase picking/packing efficiency by up to 25%.",
      skills: "Inventory Management, Warehouse Management Systems (WMS), OSHA Safety Compliance, Forklift Certification, Order Fulfillment, Staff Scheduling, Shrinkage Reduction",
      experience: [
        { role: "Operations Manager", company: "National Distro Hub", dates: "2017 - Present", description: "Manage a 150,000 sq ft facility and a team of 45 warehouse associates. Implemented barcode scanning tech that reduced picking errors from 4% to 0.5%." },
        { role: "Warehouse Supervisor", company: "Retail Supply Co.", dates: "2012 - 2017", description: "Supervised inbound receiving and outbound shipping operations. Trained new hires on safety protocols and equipment operation." }
      ],
      education: "A.S. Logistics & Supply Chain Management, Texas Tech (2012)"
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
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Layout size={20} className="text-[#808000]" /> Personnel Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" value={data.firstName} onChange={(v) => handleInputChange('firstName', v)} />
                <InputGroup label="Last Name" value={data.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                <InputGroup label="Professional Title" value={data.title} onChange={(v) => handleInputChange('title', v)} className="col-span-2" />
                <InputGroup label="Email" value={data.email} onChange={(v) => handleInputChange('email', v)} />
                <InputGroup label="Phone" value={data.phone} onChange={(v) => handleInputChange('phone', v)} />
                <InputGroup label="Location" value={data.location} onChange={(v) => handleInputChange('location', v)} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Professional Profile</h3>
              <textarea rows={4} value={data.summary} onChange={(e) => handleInputChange('summary', e.target.value)} className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-[#808000] outline-none" />
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">Operational Experience</h3><button onClick={addExperience} className="text-sm text-[#808000] font-bold">+ Add Record</button></div>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-4 border rounded-lg bg-gray-50 relative group">
                  <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Role" value={exp.role} onChange={(v) => handleArrayChange(i, 'role', v, 'experience')} />
                    <InputGroup label="Facility/Company" value={exp.company} onChange={(v) => handleArrayChange(i, 'company', v, 'experience')} />
                    <InputGroup label="Dates" value={exp.dates} onChange={(v) => handleArrayChange(i, 'dates', v, 'experience')} className="col-span-2" />
                    <textarea rows={3} value={exp.description} onChange={(e) => handleArrayChange(i, 'description', e.target.value, 'experience')} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#808000] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[#808000]" /> Skills & Training</h3>
              <InputGroup label="Operations Skills" value={data.skills} onChange={(v) => handleInputChange('skills', v)} />
              <div className="h-4"></div>
              <InputGroup label="Education & Certifications" value={data.education} onChange={(v) => handleInputChange('education', v)} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar text-slate-800">
            <div id="resume-preview" ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', position: 'relative' }}>
              <div style={{ width: '35%', backgroundColor: templateConfig.primaryColor, color: 'white', padding: '40px 30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: `3px solid ${templateConfig.accentColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '10px' }}>{data.firstName}<br /><span style={{ color: templateConfig.accentColor }}>{data.lastName}</span></h1>
                  <p style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>{data.title}</p>
                </div>
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.accentColor, marginBottom: '15px' }}>Contact</h3>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>{data.phone}</div>
                    <div>{data.email}</div>
                    <div>{data.location}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.accentColor, marginBottom: '15px' }}>Technical Skills</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.skills.split(',').map((skill, i) => (
                      <div key={i} style={{ fontSize: '11px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{skill.trim()}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: templateConfig.accentColor, marginBottom: '15px' }}>Education</h3>
                  <p style={{ fontSize: '11px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{data.education}</p>
                </div>
              </div>

              <div style={{ width: '65%', padding: '40px 45px' }}>
                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.accentColor }}></div> Profile Summary
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444' }}>{data.summary}</p>
                </section>
                <section>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: templateConfig.primaryColor, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '15px', height: '4px', backgroundColor: templateConfig.accentColor }}></div> Work Experience
                  </h3>
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '30px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{exp.role}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: templateConfig.primaryColor, fontWeight: 'bold' }}>{exp.company}</span>
                        <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#333', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{exp.dates}</span>
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', margin: 0 }}>{exp.description}</p>
                    </div>
                  ))}
                </section>
              </div>

              {generatedCvNumber && (
                <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  MANIFEST ID: {generatedCvNumber} • OPS-VERIFIED
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 text-center">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl border-t-8 border-[#808000]">
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Sync Complete</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium italic underline decoration-[#808000]/20 underline-offset-4 tracking-wide">
              Record successfully archived in the Logistics Database.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-5 rounded-2xl mb-6 flex flex-col items-center shadow-inner">
              <Box className="text-[#808000] mb-2" size={24} />
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[4px] mb-1 font-sans">Archive ID</p>
              <p className="text-2xl font-black text-[#808000] font-mono">{generatedCvNumber}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: templateConfig.primaryColor }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}