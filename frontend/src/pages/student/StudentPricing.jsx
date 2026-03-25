import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentPricing() {
  const navigate = useNavigate();

  const goStudentVerification = () => {
    navigate("/stu/verification");
  };

  const goProfessionalPayment = () => {
    navigate("/pricing/pro");
  };

  return (
    <section className="min-h-screen bg-[#F7FBFF] flex flex-col items-center px-4 pt-16 pb-10">
      {/* Heading */}
      <div className="mb-10 text-center max-w-2xl">
        <h1 className="text-[28px] sm:text-[34px] font-extrabold text-gray-900">
          Choose your plan
        </h1>

        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Students can verify using their{" "}
          <span className="font-semibold">APAAR ID</span>. Professionals can
          unlock full access with the yearly plan.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Student Card */}
        <div className="rounded-[24px] border-2 border-blue-300/70 bg-white shadow-xl ring-1 ring-blue-100/40 px-8 py-10 text-center">

          <h2 className="text-[22px] font-extrabold text-gray-900">
            Students
          </h2>

          <div className="mt-3 text-[46px] font-extrabold text-blue-600 leading-none">
            ₹10
          </div>

          <p className="mt-2 text-[13px] text-gray-500">
            or <span className="font-semibold text-gray-700">FREE</span> with APAAR ID
          </p>

          <div className="mt-7 space-y-4 text-left">
            <Feature text="All templates access" />
            <Feature text="AI resume assistance" />
            <Feature text="Lifetime validity" />
            <Feature text="Verify via APAAR ID" />
          </div>

          <button
            onClick={goStudentVerification}
            className="mt-8 w-full rounded-full bg-black py-3.5 text-[15px] font-bold text-white shadow-md transition hover:bg-gray-900"
          >
            Verify & Get Student Access
          </button>

          <p className="mt-3 text-[12px] text-gray-400">
            You’ll verify your identity before access is activated.
          </p>
        </div>

        {/* Professional Card */}
        <div className="rounded-[24px] border border-gray-200 bg-white shadow-xl ring-1 ring-gray-100/60 px-8 py-10 text-center">

          <h2 className="text-[22px] font-extrabold text-gray-900">
            Professionals
          </h2>

          <div className="mt-3 text-[46px] font-extrabold text-gray-900 leading-none">
            ₹99
            <span className="text-[14px] font-semibold text-gray-500">/year</span>
          </div>

          <p className="mt-2 text-[13px] text-gray-500">
            Full access without student verification
          </p>

          <div className="mt-7 space-y-4 text-left">
            <Feature text="All templates access" />
            <Feature text="Unlimited edits & downloads" />
            <Feature text="Priority support" />
            <Feature text="No APAAR verification required" />
          </div>

          <button
            onClick={goProfessionalPayment}
            className="mt-8 w-full rounded-full bg-blue-700 py-3.5 text-[15px] font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Pay ₹99 & Continue
          </button>

          <p className="mt-3 text-[12px] text-gray-400">
            After payment, you’ll be redirected to your dashboard.
          </p>
        </div>

      </div>

      {/* Bottom Note */}
      <div className="mt-10 max-w-3xl text-center bg-white/70 border border-blue-100 rounded-2xl px-6 py-4">
        <p className="text-sm text-gray-700">
          <span className="font-bold">Student verification:</span>{" "}
          Enter your <span className="font-semibold">APAAR ID</span> to verify your
          student status and activate your account.
        </p>
      </div>
    </section>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
        <Check className="h-4 w-4 text-green-600" />
      </div>
      <span className="text-[14px] text-gray-700 font-medium">
        {text}
      </span>
    </div>
  );
}