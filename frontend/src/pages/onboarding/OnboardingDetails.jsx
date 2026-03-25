import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Other"];

export default function OnboardingDetails() {
  const navigate = useNavigate();

  const existing = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [institution, setInstitution] = useState(existing.institutionName || "");
  const [course, setCourse] = useState(existing.courseMajor || "");
  const [year, setYear] = useState(existing.yearOfStudy || "4th Year");

  const canContinue = useMemo(() => {
    return institution.trim().length >= 2 && course.trim().length >= 2 && !!year;
  }, [institution, course, year]);

  const safeGet = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  const save = (patch) => {
    const curr = safeGet("onboarding", {});
    safeSet("onboarding", { ...curr, ...patch });
  };

  const finalizeStudentAndGo = (verificationPatch = {}) => {
    // 1) Update onboarding
    const ob = safeGet("onboarding", {});
    const u = safeGet("user", {});

    safeSet("onboarding", {
      ...ob,
      accountType: "student",
      isStudent: true,
      completed: true,
      onboardingCompleted: true,
      completedAt: new Date().toISOString(),
      ...verificationPatch,
    });

    // 2) Update user (for any UI that reads these)
    safeSet("user", {
      ...u,
      accountType: "student",
      onboardingCompleted: true,
    });

    // 3) Go to student dashboard
    navigate("/stu", { replace: true });
  };

  const onContinue = () => {
    if (!canContinue) return;

    save({
      institutionName: institution.trim(),
      courseMajor: course.trim(),
      yearOfStudy: year,
    });

    // ✅ Direct student dashboard (no verify-student step anymore)
    // finalizeStudentAndGo({
    //   detailsSkipped: false,
    // });
    navigate("/onboarding/verify-student");
  };

  const onSkip = () => {
    save({
      institutionName: institution.trim() || "SKIPPED_INSTITUTION",
      courseMajor: course.trim() || "SKIPPED_COURSE",
      yearOfStudy: year || "SKIPPED_YEAR",
      detailsSkipped: true,
    });

    // ✅ Direct student dashboard
    // finalizeStudentAndGo({
    //   detailsSkipped: true,
    // });
    navigate("/onboarding/verify-student");
  };

  return (
    <section
      className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4 py-10"
      aria-label="Onboarding details"
    >
      <Helmet>
        <title>Onboarding Details | RESUMEA</title>
        <meta
          name="description"
          content="Tell us about your institution, course, and year of study to personalize your RESUMEA experience."
        />
        <link rel="canonical" href="http://localhost:5173/onboarding/details" />
      </Helmet>

      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-24 right-[-140px] h-[520px] w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[560px] sm:max-w-[620px]">
        <div className="bg-white rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">
          {/* top line */}
          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <header className="text-center">
              <h1 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900">
                Tell us more
              </h1>
              <p className="mt-1 text-[12px] sm:text-[13px] text-gray-400">
                Help us verify your student status
              </p>
            </header>

            <div className="mt-8 space-y-5">
              {/* Institution */}
              <div>
                <label
                  htmlFor="institutionName"
                  className="block text-xs font-bold tracking-wider text-gray-500 mb-2"
                >
                  Institution Name
                </label>
                <input
                  id="institutionName"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="ABC College"
                  autoComplete="organization"
                  className="w-full h-12 rounded-xl border border-gray-200 bg-[#F3F7FF] px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              {/* Course */}
              <div>
                <label
                  htmlFor="courseMajor"
                  className="block text-xs font-bold tracking-wider text-gray-500 mb-2"
                >
                  Course / Major
                </label>
                <input
                  id="courseMajor"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="B.E CSE"
                  autoComplete="off"
                  className="w-full h-12 rounded-xl border border-gray-200 bg-[#F3F7FF] px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              {/* Year */}
              <div>
                <label
                  htmlFor="yearOfStudy"
                  className="block text-xs font-bold tracking-wider text-gray-500 mb-2"
                >
                  Year of Study
                </label>
                <div className="relative">
                  <select
                    id="yearOfStudy"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue}
                  className={[
                    "w-full rounded-xl font-bold text-white py-3 shadow-lg transition",
                    "flex items-center justify-center gap-2",
                    canContinue
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  Continue <span className="translate-y-[1px]">→</span>
                </button>

                {/* ✅ Skip for now */}
                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Skip for now
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full text-sm text-gray-500 hover:text-gray-800"
                >
                  Back
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-400">
                You can update these later from your dashboard settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}