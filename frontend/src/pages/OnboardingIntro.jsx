import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap, FileText, ArrowRight } from "lucide-react";

const OnboardingIntro = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-20 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-200px] left-[-160px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      {/* main card → MOVED UP ONLY THIS BOX */}
      <div className="relative w-full max-w-5xl -translate-y-10">
        <div className="bg-white rounded-[26px] shadow-2xl border border-gray-100 overflow-hidden">
          {/* top gradient line */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="grid md:grid-cols-2">
            {/* LEFT BLUE PANEL */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-10 md:p-12 text-white">
              {/* brand */}
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-extrabold tracking-tight">
                  RESUME<span className="text-white/90">A</span>
                </div>
              </div>

              <h1 className="mt-10 text-4xl md:text-5xl font-extrabold leading-[1.05]">
                The future of{" "}
                <span className="text-white/85">professional</span>{" "}
                identity is here.
              </h1>

              <p className="mt-6 text-sm md:text-base text-white/80 max-w-md leading-relaxed">
                Powered by next-gen AI to craft resumes that don't just list skills—
                they tell your story.
              </p>

              {/* bottom cards */}
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
                <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold text-sm">AI Neural Engine</div>
                  <div className="mt-1 text-[11px] text-white/75 leading-relaxed">
                    Adaptive content generation that evolves with you.
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold text-sm">ATS Optimization</div>
                  <div className="mt-1 text-[11px] text-white/75 leading-relaxed">
                    Engineered to bypass algorithms and reach humans.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT WHITE PANEL */}
            <div className="p-10 md:p-12">
              <div className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-600">
                PREMIUM ACCESS
              </div>

              <h2 className="mt-5 text-3xl font-extrabold text-gray-900">
                Elevate your career.
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Configure your professional profile in seconds.
              </p>

              <div className="mt-8 space-y-5">
                <Feature
                  title="Profile Profiling"
                  desc="Deep analysis of your career trajectory."
                />
                <Feature
                  title="Intelligent Matching"
                  desc="Auto-alignment with industry benchmarks."
                />
                <Feature
                  title="Instant Deployment"
                  desc="Export high-fidelity, interactive resumes."
                />
              </div>

              <button
                onClick={() => navigate("/signup")}
                className="mt-10 w-full rounded-2xl bg-[#0B1733] text-white font-bold py-4 shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                Start Experience <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Feature = ({ title, desc }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
      </div>
      <div>
        <div className="font-bold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{desc}</div>
      </div>
    </div>
  );
};

export default OnboardingIntro;
