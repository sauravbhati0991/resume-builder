import React from "react";
import { Check, Sparkles, BadgePercent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function StudentPricing() {
  const navigate = useNavigate();
  const [isApaarVerified, setIsApaarVerified] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const onboarding = res.data?.onboarding || res.data?.data?.onboarding || {};

        if (onboarding.verificationMethod === "APAAR" && onboarding.verificationStatus === "VERIFIED") {
          setIsApaarVerified(true);
        }
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleApaarVerify = async () => {
    const res = await api.get("/verification/apaar/auth-url");
    window.location.href = res.data.url;
  };

  const goSkipVerificationPayment = () => {
    // Standard price is 99 for everyone who skips verification
    navigate("/stu/payment", { state: { amount: 99, planName: "Standard" } });
  };

  const goDiscountedPayment = () => {
    const amount = isApaarVerified ? 49 : 99;
    navigate("/stu/payment", { state: { amount, planName: "Verified Student", isDiscounted: isApaarVerified } });
  };

  return (
    <section className="min-h-screen bg-[#F4FFF7] flex flex-col items-center px-4 pt-16 pb-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-green-100/20 blur-[100px]" />
      </div>

      {/* Heading */}
      <div className="relative mb-10 text-center max-w-2xl px-4">
        <h1 className="text-[28px] sm:text-[34px] font-extrabold text-gray-900 leading-tight">
          Choose your plan
        </h1>

        <p className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed">
          Verify your <span className="font-bold text-green-600 border-b-2 border-green-200">APAAR ID</span> to unlock exclusive student benefits and get 50% off.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Student Verification Focused Card */}
        <div className="rounded-[24px] border-2 border-green-600 bg-white shadow-2xl ring-1 ring-green-100 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-lg">
            Best Value
          </div>

          <h2 className="text-[22px] font-extrabold text-gray-900">
            For Students
          </h2>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`text-[46px] font-extrabold leading-none ${isApaarVerified ? "text-green-600" : "text-gray-900"}`}>
              {isApaarVerified ? "₹49" : "₹99"}
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[14px] font-semibold text-gray-500">/year</span>
              {isApaarVerified ? (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 flex items-center gap-1">
                  <BadgePercent className="w-3 h-3" /> 50% DISCOUNT APPLIED
                </span>
              ) : (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 uppercase tracking-tight">
                  Verify APAAR for ₹49
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-[13px] text-gray-500 font-medium">
            {isApaarVerified
              ? "Your student identity is verified for 1 year!"
              : "Get 1-year access with your APAAR student identity."}
          </p>

          <div className="mt-6 pt-6 border-t border-gray-50 space-y-4 text-left">
            <Feature text="All templates access" />
            <Feature text="AI resume assistance" />
            <Feature text="1 Year Validity" />
            <Feature text="APAAR Verification required" />
          </div>

          {isApaarVerified ? (
            <button
              onClick={goDiscountedPayment}
              className="mt-8 w-full rounded-full bg-green-600 py-4 text-[15px] font-bold text-white shadow-lg transition hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Pay ₹49 & Activate Plan
            </button>
          ) : (
            <button
              onClick={handleApaarVerify}
              className="mt-8 w-full rounded-full bg-green-600 py-4 text-[15px] font-bold text-white shadow-lg transition hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Verify APAAR & Get 50% Off
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-[1px] bg-gray-100 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">OR</span>
            <div className="h-[1px] bg-gray-100 flex-1"></div>
          </div>

          <button
            onClick={goSkipVerificationPayment}
            className="mt-4 w-full rounded-full bg-white border-2 border-green-900 py-3 text-[14px] font-bold text-green-900 transition hover:bg-green-50"
          >
            Pay ₹99 & Skip Verification
          </button>
        </div>

        {/* Professionals Card */}
        <div className="rounded-[24px] border border-gray-200 bg-white shadow-xl ring-1 ring-gray-100/60 px-8 py-10 text-center">

          <h2 className="text-[22px] font-extrabold text-gray-900">
            Professionals
          </h2>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="text-[46px] font-extrabold text-gray-900 leading-none">
              ₹99
            </div>
            <span className="text-[14px] font-semibold text-gray-500">/year</span>
          </div>

          <p className="mt-3 text-[13px] text-gray-500">
            Full access without student verification.
          </p>

          <div className="mt-6 pt-6 border-t border-gray-50 space-y-4 text-left">
            <Feature text="All templates access" />
            <Feature text="Unlimited edits & downloads" />
            <Feature text="Priority support" />
            <Feature text="1 Year Validity" />
          </div>

          <button
            onClick={goDiscountedPayment}
            className="mt-8 w-full rounded-full bg-gray-900 py-4 text-[15px] font-bold text-white shadow-lg transition hover:bg-black"
          >
            Pay ₹99 Yearly & Continue
          </button>

          <p className="mt-4 text-[12px] text-gray-400">
            Instant access after successful payment.
          </p>
        </div>

      </div>

      {/* Bottom Note */}
      <div className="mt-12 max-w-3xl text-center bg-green-50/50 border border-green-100 rounded-3xl px-8 py-6 relative z-10">
        <p className="text-sm text-green-900 leading-relaxed font-medium">
          <span className="font-bold">Student Verification:</span> Simply enter your 12-digit
          <span className="font-bold"> APAAR ID</span> to instantly verify your status and unlock the
          <span className="font-bold"> 50% discount</span>. All plans are subject to 1-year renewal terms.
        </p>
      </div>

      {/* Debug Section */}
      <div className="mt-12 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={async () => {
            if (!window.confirm("DEBUG: Reset verification status?")) return;
            try {
              setLoading(true);
              await api.patch("/users/me/onboarding", {
                verificationStatus: "NONE",
                verificationMethod: "NONE",
                apaarId: null
              });
              window.location.reload();
            } catch (err) {
              alert("Failed to reset");
            } finally {
              setLoading(false);
            }
          }}
          className="text-[10px] font-black uppercase tracking-tighter text-gray-400 border border-gray-200 px-3 py-1 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
        >
          Reset Verification Status (Debug)
        </button>
      </div>
    </section>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      </div>
      <span className="text-[14px] text-gray-700 font-medium">
        {text}
      </span>
    </div>
  );
}