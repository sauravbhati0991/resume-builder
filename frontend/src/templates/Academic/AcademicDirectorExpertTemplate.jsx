import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../../utils/api";
import { ArrowLeft, Save, Download, Trash2, Loader2, BookOpen, GraduationCap, Award, ShieldCheck } from 'lucide-react';

const InputGroup = ({ label, name, value, onChange, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="text-xs font-medium text-gray-500 mb-1 block uppercase tracking-wider">{label}</label>
    <input type="text" id={name}
      name={name}
      value={value}
      onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#312e81]" />
  </div>
);

export default function AcademicDirectorExpertTemplate({ templateId, saveResume, downloadResume, initialData }) {
  const navigate = useNavigate();
  // // const { templateId } = useParams(); // Now received via props // Now received via props
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
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedCvNumber, setSavedCvNumber] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState(initialData || templateConfig.defaultData);

  const handleInputChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleArrayChange = (index, arrayName, e) => {
    const { name, value } = e.target;
    const newArray = [...data[arrayName]];
    newArray[index][name] = value;
    setData(prev => ({ ...prev, [arrayName]: newArray }));
  };
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", dates: "", description: "" }] }));
  const removeExperience = (index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cvNumber = await saveResume(data);
      if (cvNumber) {
        setSavedCvNumber(cvNumber);
        // Background PDF Upload to Cloudinary
        try {
          const element = previewRef.current;
          const pdfBlob = await html2pdf()
            .set({
              margin: 0,
              filename: `${data.firstName}_Resume.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(element)
            .outputPdf('blob');

          const formData = new FormData();
          formData.append("file", pdfBlob, `${cvNumber}.pdf`);
          formData.append("cvNumber", cvNumber);

          await api.post("/resume-upload/resume-pdf", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        } catch (uploadError) {
          console.error("Background PDF upload failed:", uploadError);
        }
        setShowSaveSuccessModal(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${data.firstName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (element) {
      html2pdf().set(opt).from(element).save();
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
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Draft
            </button>
            <button onClick={downloadPDF} disabled={isDownloading} className="inline-flex items-center text-sm font-medium h-9 px-4 rounded-md text-white shadow-md hover:opacity-90 transition-all" style={{ backgroundColor: templateConfig.primaryColor }}>
              {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Export Dossier</>}
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
                <InputGroup label="First Name" name="firstName" value={data.firstName} onChange={handleInputChange} />
                <InputGroup label="Last Name" name="lastName" value={data.lastName} onChange={handleInputChange} />
                <InputGroup label="Academic Title" name="title" value={data.title} onChange={handleInputChange} className="col-span-2" />
                <InputGroup label="Institutional Email" name="email" value={data.email} onChange={handleInputChange} />
                <InputGroup label="Phone" name="phone" value={data.phone} onChange={handleInputChange} />
                <InputGroup label="Campus/Location" name="location" value={data.location} onChange={handleInputChange} className="col-span-2" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#312e81]"><Award size={20} /> Executive Statement</h3>
              <textarea rows={4} value={data.summary} id="summary" name="summary" onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-[#312e81] outline-none bg-gray-50/50 leading-relaxed" />
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
                    <InputGroup label="Role" name="role" value={exp.role} onChange={(e) => handleArrayChange(i, 'experience', e)} />
                    <InputGroup label="Institution" name="company" value={exp.company} onChange={(e) => handleArrayChange(i, 'experience', e)} />
                    <InputGroup label="Dates of Appointment" name="dates" value={exp.dates} onChange={(e) => handleArrayChange(i, 'experience', e)} className="col-span-2" />
                    <textarea rows={3} value={exp.description} id="description" name="description" onChange={(e) => handleArrayChange(i, 'experience', e)} className="col-span-2 border rounded p-2 text-sm focus:ring-2 focus:ring-[#312e81] outline-none" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#312e81]">Pedagogy & Credentials</h3>
              <InputGroup label="Core Competencies (Comma separated)" name="skills" value={data.skills} onChange={handleInputChange} />
              <div className="h-4"></div>
              <InputGroup label="Academic Background" name="education" value={data.education} onChange={handleInputChange} />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="h-full bg-slate-200 rounded-xl overflow-auto flex justify-center p-8 custom-scrollbar">
            <div ref={previewRef} style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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


            </div>
          </div>
        </div>
      </div>





    </div>
  );
}