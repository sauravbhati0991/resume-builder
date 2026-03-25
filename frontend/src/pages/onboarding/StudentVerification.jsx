import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info, FileText } from "lucide-react";
import api from "../../utils/api"; 

export default function StudentVerification() {
  const navigate = useNavigate();

  const [apaar, setApaar] = useState("");

  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const cleanApaAR = (v) => v.replace(/\D/g, "").slice(0, 12);

  const formatted = useMemo(() => {
    const d = apaar;
    const p1 = d.slice(0, 4);
    const p2 = d.slice(4, 8);
    const p3 = d.slice(8, 12);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }, [apaar]);

  const canVerifyApaAR = apaar.length === 12;
  const canUpload = !!file;

  const setMsg = (type, text) => {
    if (type === "error") {
      setError(text || "");
      setInfo("");
    } else {
      setInfo(text || "");
      setError("");
    }
  };

  const safeGet = (k, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };

  const safeSet = (k, v) => {
    localStorage.setItem(k, JSON.stringify(v));
  };

  const finalizeAndRedirect = async (verificationPatch = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      if (token) {
        await api.patch("/users/me/onboarding", {
          accountType: "student",
          isStudent: true,
          completed: true,
          onboardingCompleted: true,
          ...verificationPatch
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

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

      safeSet("user", {
        ...u,
        accountType: "student",
        onboardingCompleted: true,
      });

      navigate("/stu", { replace: true });

    } catch (err) {
      console.error(err);
      setMsg("error", "Something went wrong saving your data. Please try again.");
      setLoading(false);
    }
  };

  const onVerifyApaAR = () => {
    if (!canVerifyApaAR) return;

    setMsg("info", "Verifying...");

    finalizeAndRedirect({
      apaarId: apaar,
      verificationMethod: "APAAR",
      otpVerified: true
    });
  };

  const onSkip = () => {
    finalizeAndRedirect({
      verificationMethod: "SKIPPED",
      otpVerified: false
    });
  };

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMsg("info", "Transcript selected. Click 'Activate via Transcript' to finish.");
  };

  const onUploadContinue = () => {
    if (!canUpload) return;

    finalizeAndRedirect({
      transcriptFileName: file?.name,
      verificationMethod: "TRANSCRIPT",
      otpVerified: true
    });
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4 py-10">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-24 right-[-140px] h-[520px] w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[520px]">
        <div className="bg-white rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">

          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 sm:px-10 py-10">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div className="text-center">
              <h1 className="text-[20px] font-extrabold text-gray-900">
                Student Verification
              </h1>
              <p className="mt-2 text-[12px] text-gray-400 leading-relaxed">
                Verify via <span className="font-semibold text-blue-600">APAAR</span>.
              </p>
            </div>

            {info && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {info}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* APAAR */}
            <div className="mt-8">
              <label className="block text-[11px] font-extrabold tracking-wider text-gray-500 mb-2">
                APAAR ID (12 DIGITS)
              </label>

              <div className="rounded-2xl border-2 border-[#0B1733] bg-white px-4 py-4">
                <input
                  value={formatted}
                  onChange={(e) => setApaar(cleanApaAR(e.target.value))}
                  placeholder="Enter you APAAR"
                  className="w-full bg-transparent text-center text-[14px] tracking-[0.32em] font-semibold outline-none text-gray-700 placeholder:text-gray-300"
                  disabled={loading}
                />
              </div>

              <div className="mt-3 flex gap-2 text-[11px] text-gray-400 leading-snug">
                <Info className="h-4 w-4 translate-y-[1px]" />
                <p>Enter any 12 digit APAAR number to continue.</p>
              </div>

<button
  type="button"
  onClick={onVerifyApaAR}
  disabled={!canVerifyApaAR || loading}
  className={[
    "mt-5 w-full rounded-xl font-bold py-3 shadow-lg transition",
    canVerifyApaAR && !loading
      ? "bg-[#0B1733] text-white hover:bg-[#071028]"
      : "bg-gray-300 text-white/70 cursor-not-allowed",
  ].join(" ")}
>
  {loading ? "Processing..." : "Verify via APAAR"}
</button>
            </div>



            <div className="mt-8 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={onSkip}
                disabled={loading}
                className="w-full text-[14px] font-bold text-gray-400 hover:text-gray-800 transition"
              >
                Skip for now & Go to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}