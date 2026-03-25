import { Upload, SquarePen, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

export default function CreateResume() {
  const navigate = useNavigate();
  const [uploadActive, setUploadActive] = useState(false);
  const fileInputRef = useRef(null);
  const [scratchActive, setScratchActive] = useState(false);

  const handleSelectFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File selected: ${file.name}`);
      // Future: Navigate to parser logic
    }
  };

  // Navigate directly to the General Template builder
  const goToBuilder = () => {
    navigate("/builder/general"); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="min-h-screen bg-[#F8F9FB]">
        
        {/* BODY (Added extra top padding because the global navbar is fixed) */}
        <div className="pt-28 px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Resume</h1>
            <p className="text-gray-500 text-lg">Select how you want to begin</p>
          </div>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 mb-12">

            {/* UPLOAD CARD */}
            <div
              onClick={() => { setUploadActive(true); setScratchActive(false); }}
              className={`relative p-10 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl bg-white ${
                uploadActive ? "border-green-500 ring-4 ring-green-50/50 scale-[1.02]" : "border-gray-100 hover:border-green-400"
              }`}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${uploadActive ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-800">Upload Existing</h3>
                <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
                  Upload your existing PDF or DOCX. We'll extract the data to give you a head start.
                </p>

                {/* BUTTON AREA */}
                {!uploadActive ? (
                  <span className="text-sm font-bold text-green-600 mt-auto uppercase tracking-wide">Select Option</span>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFile();
                      }}
                      className="mt-auto w-full py-3 border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition"
                    >
                      Select File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* SCRATCH CARD */}
            <div
              onClick={() => { setScratchActive(true); setUploadActive(false); }}
              className={`relative p-10 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl bg-white ${
                scratchActive ? "border-blue-600 ring-4 ring-blue-50/50 scale-[1.02]" : "border-gray-100 hover:border-blue-400"
              }`}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${scratchActive ? "bg-blue-100 text-blue-600" : "bg-gray-50 text-gray-400"}`}>
                  <SquarePen className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-800">Start from Scratch</h3>
                <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
                  Start with a clean slate using our professional builder template.
                </p>

                {!scratchActive ? (
                  <span className="text-sm font-bold text-blue-600 mt-auto uppercase tracking-wide">Select Option</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToBuilder();
                    }}
                    className="mt-auto w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition"
                  >
                    Start Building
                  </button>
                )}
              </div>
            </div>

          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
            >
              Cancel & Go Back
            </button>
          </div>

          {/* PRO TIP */}
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-sm flex gap-4 items-start">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-800 block mb-1">Pro Tip:</span>
                Did you know? Tailoring your resume keywords to the job description increases your ATS ranking by up to 70%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}