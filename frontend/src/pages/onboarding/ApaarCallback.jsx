import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Loader2, XCircle } from "lucide-react";

export default function ApaarCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failReason, setFailReason] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const errParam = params.get("error");
    const reason = params.get("reason");

    if (errParam) {
      setError(getErrorMessage(errParam));
      setLoading(false);
      return;
    }

    if (status === "failed") {
      setFailReason(reason || "no_apaar");
      setLoading(false);
      return;
    }

    // If no params at all, wait briefly then show error
    setTimeout(() => {
      setError("Invalid callback state. Please try again.");
      setLoading(false);
    }, 2000);
  }, [location]);

  const getErrorMessage = (code) => {
    const messages = {
      no_code: "DigiLocker did not return an authorization code.",
      no_token: "Failed to get access token from DigiLocker.",
      user_not_found: "User account not found.",
      missing_pkce: "Security verification failed. Please try again.",
      server_error: "Server error during verification.",
      access_denied: "DigiLocker access was denied.",
    };
    return messages[code] || `Verification error: ${code}`;
  };

  const getFailMessage = () => {
    if (failReason === "api_error") {
      return "We couldn't connect to DigiLocker's document service. This is a temporary issue — please try again in a few minutes.";
    }
    return "No APAAR / ABC document was found in your DigiLocker account. The student discount is only available for users with an APAAR card linked to their DigiLocker.";
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Processing verification...</p>
              </div>
            ) : failReason ? (
              /* ============ APAAR NOT FOUND ============ */
              <div className="space-y-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900">
                  Student Verification Failed
                </h1>
                <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-5">
                  <p className="text-sm text-red-800 font-medium leading-relaxed">
                    {getFailMessage()}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
                  <p className="text-xs font-bold text-blue-700 mb-2">How to fix this:</p>
                  <ol className="text-xs text-blue-600 space-y-1.5 list-decimal list-inside">
                    <li>Go to <a href="https://www.abc.gov.in/" target="_blank" rel="noopener noreferrer" className="font-bold underline">abc.gov.in</a> and create your APAAR card</li>
                    <li>Ensure your APAAR card is linked to your DigiLocker</li>
                    <li>Come back and verify again</li>
                  </ol>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/onboarding/verify-student")}
                    className="w-full rounded-2xl bg-gray-900 py-4 text-white font-black hover:bg-black transition shadow-xl"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate("/stu/pricing")}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-800 transition"
                  >
                    Continue without discount
                  </button>
                </div>
              </div>
            ) : error ? (
              /* ============ ERROR STATE ============ */
              <div className="space-y-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                  <ShieldCheck className="h-7 w-7 text-red-600" />
                </div>
                <h1 className="text-2xl font-black text-gray-900">Verification Error</h1>
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
                <button
                  onClick={() => navigate("/onboarding/verify-student")}
                  className="w-full rounded-2xl bg-gray-900 py-4 text-white font-black hover:bg-black transition shadow-xl"
                >
                  Return to Verification
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
