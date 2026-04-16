import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info, User, CheckCircle2 } from "lucide-react";
import api from "../../utils/api";

export default function StudentVerification() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);


  const setMsg = (type, text) => {
    if (type === "error") {
      setError(text || "");
      setSuccessData(null);
    } else {
      setError("");
    }
  };

  const updateLocalStorage = (resData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        accountType: resData.accountType || user.accountType,
        onboardingCompleted: true
      }));
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  };

  const handleVerifyApaar = async () => {
    setLoading(true);
    setMsg("info", "");
    try {
      const res = await api.get("/verification/apaar/auth-url");
      if (res.data && res.data.url) {
        // Redirect to DigiLocker
        window.location.href = res.data.url;
      } else {
        setMsg("error", "Failed to get authorization URL");
      }
    } catch (err) {
      setMsg("error", err.response?.data?.message || "Verification failed");
      setLoading(false);
    }
  };

  const onSkip = async () => {
    try {
      setLoading(true);
      await api.patch("/users/me/onboarding", {
        verificationMethod: "SKIPPED",
        verificationStatus: "SKIPPED",
        completed: true,
        onboardingCompleted: true
      });
      navigate("/stu", { replace: true });
    } catch (err) {
      setMsg("error", "Failed to skip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FFF9] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-[90px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-green-300/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[500px]">
        <div className="bg-white rounded-[32px] shadow-2xl border border-green-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500" />

          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <ShieldCheck className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Student Verification</h1>
              <p className="mt-2 text-sm text-gray-500">Verify your APAAR ID to unlock exclusive student benefits.</p>
            </div>

            {successData ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-50 border-2 border-green-100 rounded-3xl p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">APAAR Verified!</h2>
                  <div className="mt-4 space-y-1">
                    <p className="text-lg font-bold text-green-700">{successData.name}</p>
                    <p className="text-sm text-gray-600">{successData.detail1}</p>
                    <p className="text-sm text-gray-600">{successData.detail2}</p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-green-100 border border-green-200 text-[11px] font-black text-green-700 uppercase tracking-wider">
                      Valid Until: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/stu/payment", { state: { amount: 49, planName: "Verified Student", isDiscounted: true } })}
                  className="w-full rounded-2xl bg-black py-4 text-white font-black hover:bg-gray-900 transition shadow-xl"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/DigiLocker_logo.svg/1200px-DigiLocker_logo.svg.png"
                      alt="DigiLocker"
                      className="h-6 object-contain mt-0.5"
                    />
                    <div className="text-sm text-blue-900 leading-relaxed font-medium">
                      You will be redirected to DigiLocker to authenticate your Identity and fetch your APAAR / ABC details securely.
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyApaar}
                    disabled={loading}
                    className="w-full rounded-2xl bg-blue-600 py-4 text-white font-black hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-100 flex justify-center items-center gap-2"
                  >
                    {loading ? "Redirecting..." : "Verify with DigiLocker"}
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                  <div className="flex items-start gap-3 text-[11px] text-gray-400 leading-relaxed">
                    <Info className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p>Verification is processed securely. Your enrollment details will be automatically extracted into your profile sheet.</p>
                  </div>
                  <button
                    onClick={onSkip}
                    disabled={loading}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-800 transition"
                  >
                    Skip & View Standard Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}