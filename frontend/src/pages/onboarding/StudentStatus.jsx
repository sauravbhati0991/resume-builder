import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase } from "lucide-react";
import api from "../../utils/api";

export default function StudentStatus() {
  const navigate = useNavigate();

  const [isStudent, setIsStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const safeParse = (key, fallback = {}) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  };

  const patchOnboarding = async (payload) => {
    const token = localStorage.getItem("userToken"); // ✅ always fresh
    if (!token) throw new Error("NO_TOKEN");

    const res = await api.patch("/users/me/onboarding", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const me = res?.data || {};
    safeSet("user", me);
    safeSet("onboarding", me?.onboarding || {});
    return me;
  };

  const handleContinue = async () => {
    if (!isStudent) return;

    const token = localStorage.getItem("userToken");

    // ✅ If NOT logged in → just store choice and go signup/login
    if (!token) {
      const ob = safeParse("onboarding", {});
      safeSet("onboarding", {
        ...ob,
        isStudent,
        accountType: isStudent === "no" ? "professional" : "student",
      });

      navigate("/signup", { replace: true }); // or "/login"
      return;
    }

    try {
      setLoading(true);

      if (isStudent === "no") {
        // ✅ PROFESSIONAL
        await patchOnboarding({
          accountType: "professional",
          isStudent: false,
          completed: true,
        });

        navigate("/pro", { replace: true });
        return;
      }

      // ✅ STUDENT
      await patchOnboarding({
        accountType: "student",
        isStudent: true,
      });

      navigate("/onboarding/academic");
    } catch (e) {
      // fallback: if patch fails, still route based on selection
      if (isStudent === "no") navigate("/pro", { replace: true });
      else navigate("/onboarding/academic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4">
      <div className="relative w-full max-w-[520px]">
        <div className="bg-white rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">
          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 sm:px-10 py-10">
            <div className="text-center">
              <h1 className="text-[20px] font-extrabold text-gray-900">
                Are you currently a student?
              </h1>
              <p className="mt-1 text-[12px] text-gray-400">
                This helps us personalize your resume experience.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChoiceCard
                active={isStudent === "yes"}
                onClick={() => setIsStudent("yes")}
                icon={<GraduationCap className="h-7 w-7" />}
                title="Yes, I am"
                subtitle="Current student"
              />
              <ChoiceCard
                active={isStudent === "no"}
                onClick={() => setIsStudent("no")}
                icon={<Briefcase className="h-7 w-7" />}
                title="No, I'm not"
                subtitle="Professional"
              />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!isStudent || loading}
              className={[
                "mt-8 w-full py-3 rounded-xl font-extrabold text-white shadow-lg transition",
                isStudent && !loading
                  ? "bg-[#0B1733] hover:bg-[#071028]"
                  : "bg-[#0B1733]/40 cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Saving..." : "Continue"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 w-full text-sm text-gray-500 hover:text-gray-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChoiceCard({ active, onClick, icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl p-6 border transition",
        "shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)]",
        active
          ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200"
          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50",
      ].join(" ")}
      aria-pressed={active}
    >
      <div className="mb-3 w-12 h-12 flex items-center justify-center rounded-xl border bg-gray-50 border-gray-200">
        <span className={active ? "text-white" : "text-blue-600"}>{icon}</span>
      </div>

      <div className="font-extrabold">{title}</div>
      <div className={["text-xs mt-1", active ? "text-blue-100" : "text-gray-400"].join(" ")}>
        {subtitle}
      </div>
    </button>
  );
}