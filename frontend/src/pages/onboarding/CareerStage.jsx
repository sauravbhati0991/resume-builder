import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const OPTIONS = [
  { key: "fresh_graduate", title: "Fresh Graduate", sub: "Starting from scratch" },
  { key: "junior", title: "Junior", sub: "Less than 1 year" },
  { key: "early_career", title: "Early Career", sub: "1 - 3 years experience" },
  { key: "mid_senior", title: "Mid-Senior", sub: "3 - 5 years experience" },
  { key: "expert", title: "Expert", sub: "5 - 10 years experience" },
  { key: "executive", title: "Executive", sub: "10+ years experience" },
];

export default function CareerStage() {
  const navigate = useNavigate();

  const existing = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [selected, setSelected] = useState(existing.careerStage || "");

  const save = (patch) => {
    const curr = (() => {
      try {
        return JSON.parse(localStorage.getItem("onboarding") || "{}");
      } catch {
        return {};
      }
    })();
    localStorage.setItem("onboarding", JSON.stringify({ ...curr, ...patch }));
  };

  const onPick = (opt) => {
    setSelected(opt.key);
    save({ careerStage: opt.key });
  };

  const onContinue = () => {
    if (!selected) return;
    navigate("/onboarding/student");
  };

  const onSkip = () => {
    save({ careerStage: "SKIPPED" });
    navigate("/onboarding/student");
  };

  return (
    <section
      className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-10"
      aria-label="Career stage selection"
    >
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-24 right-[-140px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-200px] left-[-160px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      {/* container */}
      <div className="relative w-full max-w-[520px] sm:max-w-[640px] -translate-y-6 sm:-translate-y-8 md:-translate-y-12">
        <div className="bg-white rounded-[22px] sm:rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">

          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-5 sm:px-8 md:px-10 py-8 sm:py-9 md:py-10">
            <header className="text-center">
              <h1 className="text-[18px] sm:text-[20px] md:text-[22px] font-extrabold text-gray-900">
                Your Career Stage
              </h1>

              <p className="mt-1 text-[11px] sm:text-[12px] md:text-[13px] text-gray-500">
                We’ll adapt the builder to your level
              </p>
            </header>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {OPTIONS.map((opt) => {
                const active = selected === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onPick(opt)}
                    className={[
                      "text-left rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-4 sm:py-5 transition",
                      "shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)]",
                      "focus:outline-none focus:ring-2 focus:ring-blue-200",
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] font-extrabold">
                      {opt.title}
                    </div>

                    <div
                      className={`mt-1 text-[11px] sm:text-[12px] ${
                        active ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onContinue}
                disabled={!selected}
                className={[
                  "w-full py-2.5 sm:py-3 rounded-xl font-bold text-white shadow-lg transition text-sm sm:text-base",
                  "bg-[#0B1733] hover:bg-[#071028]",
                  !selected ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={onSkip}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-xs sm:text-sm text-gray-500 hover:text-gray-800"
              >
                Back
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}