import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  GraduationCap,
  BookOpen,
  Award,
  School,
  Sparkles,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const OPTIONS = [
  {
    key: "secondary_school",
    title: "Secondary School",
    icon: <School className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
  {
    key: "diploma_associate",
    title: "Diploma / Associate",
    icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
  {
    key: "bachelors_degree",
    title: "Bachelor's Degree",
    icon: <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
  {
    key: "masters_degree",
    title: "Master's Degree",
    icon: <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
  {
    key: "phd_doctorate",
    title: "PhD / Doctorate",
    icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
  {
    key: "other",
    title: "Other",
    icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />,
  },
];

export default function AcademicPursuit() {
  const navigate = useNavigate();

  const existing = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [selected, setSelected] = useState(
    existing.academicPursuit || ""
  );
  const [otherText, setOtherText] = useState(
    existing.academicPursuitOther || ""
  );

  const save = (patch) => {
    const curr = JSON.parse(localStorage.getItem("onboarding") || "{}");
    localStorage.setItem(
      "onboarding",
      JSON.stringify({ ...curr, ...patch })
    );
  };

  const onPick = (opt) => {
    setSelected(opt.key);

    if (opt.key !== "other") {
      save({
        academicPursuit: opt.key,
        academicPursuitOther: "",
      });

      navigate("/onboarding/details");
    }
  };

  const onContinueOther = () => {
    if (!otherText.trim()) return;

    save({
      academicPursuit: "other",
      academicPursuitOther: otherText.trim(),
    });

    navigate("/onboarding/details");
  };

  const onSkip = () => {
    save({
      academicPursuit: "SKIPPED",
      academicPursuitOther: "",
    });

    navigate("/onboarding/details");
  };

  return (
    <>
      <Helmet>
        <title>Academic Pursuit | RESUMEA</title>
        <meta
          name="description"
          content="Select your academic qualification to personalize your resume building journey."
        />
      </Helmet>

      <section className="min-h-[100svh] relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-10">

        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
          <div className="absolute top-24 right-[-140px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
          <div className="absolute bottom-[-200px] left-[-160px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-[520px] sm:max-w-[640px]">
          <div className="bg-white rounded-[22px] sm:rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">

            <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="px-5 sm:px-8 md:px-10 py-8 sm:py-10">

              <header className="text-center">
                <h1 className="text-[18px] sm:text-[20px] md:text-[22px] font-extrabold text-gray-900">
                  Academic Pursuit
                </h1>

                <p className="mt-1 text-[11px] sm:text-[12px] md:text-[13px] text-gray-400">
                  Select your current or highest qualification
                </p>
              </header>

              {/* OPTIONS */}
              <div className="mt-6 sm:mt-7 space-y-3 sm:space-y-4">
                {OPTIONS.map((opt) => {
                  const active = selected === opt.key;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onPick(opt)}
                      className={[
                        "w-full flex items-center justify-between rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 transition",
                        "focus:outline-none focus:ring-2 focus:ring-blue-200",
                        active
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white">
                          {opt.icon}
                        </div>

                        <div className="text-left">
                          <div className="text-[13px] sm:text-[14px] md:text-[15px] font-extrabold text-gray-900">
                            {opt.title}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                    </button>
                  );
                })}
              </div>

              {/* OTHER INPUT */}
              {selected === "other" && (
                <div className="mt-5 sm:mt-6 space-y-3">
                  <input
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Enter your qualification"
                    className="w-full h-11 sm:h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  <button
                    onClick={onContinueOther}
                    disabled={!otherText.trim()}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 text-white text-sm sm:text-base font-bold hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* FOOTER */}
              <div className="mt-5 sm:mt-6 flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={onSkip}
                  className="w-full rounded-xl border border-gray-200 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Skip for now
                </button>

                <button
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
    </>
  );
}