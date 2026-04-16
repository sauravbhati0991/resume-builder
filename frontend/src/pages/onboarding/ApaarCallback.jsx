import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../utils/api";

export default function ApaarCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("status");
    const errParam = searchParams.get("error");

    if (errParam) {
      setError(errParam);
      setLoading(false);
      return;
    }

    if (status === "success") {
      fetchUpdatedUser();
    } else {
      // In case they reach here without query params
      setError("Waiting for backend verification...");
      // Optionally we could poll here or just say invalid
    }
  }, [location]);

  const fetchUpdatedUser = async () => {
    try {
      setLoading(true);
      // Fetch the updated user data to get the verified APAAR details
      const res = await api.get("/users/me");
      const user = res.data.data;
      
      const onboarding = user.onboarding || {};
      
      if (onboarding.verificationStatus === "VERIFIED") {
        updateLocalStorage(user);
        navigate("/stu/pricing", { replace: true });
      } else {
        setError("Verification not completed successfully.");
      }
    } catch (err) {
      setError("Failed to fetch verified profile data.");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalStorage = (resData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        accountType: resData.accountType || user.accountType || "student",
        onboardingCompleted: true
      }));
    } catch (e) {
      console.error("Local storage sync error", e);
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
          
          <div className="px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <ShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">DigiLocker Verification</h1>
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Finalizing your profile update...</p>
              </div>
            )}

            {error && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
                <button
                  onClick={() => navigate("/stu/verification")}
                  className="w-full rounded-2xl bg-gray-900 py-4 text-white font-black hover:bg-black transition shadow-xl"
                >
                  Return to Verification
                </button>
              </div>
            )}

            {successData && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300 mt-6">
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
