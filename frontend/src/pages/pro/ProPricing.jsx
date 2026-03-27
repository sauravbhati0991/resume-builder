import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProPricing() {
  const navigate = useNavigate();

  const handlePayment = () => {
    navigate("/pro/payment", {
      state: { amount: 99, planName: "Professional" },
    });
  };

  return (
    <section className="min-h-screen bg-[#F7FBFF] flex flex-col items-center px-4 pt-16 pb-10">

      {/* Heading (same tone as student) */}
      <div className="mb-10 text-center max-w-xl">
        <h1 className="text-[28px] sm:text-[34px] font-extrabold text-gray-900">
          Professional Plan
        </h1>

        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Unlock full access to all resume tools with a simple yearly plan.
        </p>
      </div>

      {/* SAME CARD SIZE */}
      <div className="w-full max-w-[420px]">
        <div className="rounded-[24px] border border-gray-200 bg-white shadow-xl ring-1 ring-gray-100/60 px-8 py-10 text-center">

          {/* Title */}
          <h2 className="text-[22px] font-extrabold text-gray-900">
            Professionals
          </h2>

          {/* Price */}
          <div className="mt-3 text-[46px] font-extrabold text-gray-900 leading-none">
            ₹99
            <span className="text-[14px] font-semibold text-gray-500">/year</span>
          </div>

          {/* Subtext (same style as student card) */}
          <p className="mt-2 text-[13px] text-gray-500">
            Full access without student verification
          </p>

          {/* Features (same structure as student) */}
          <div className="mt-7 space-y-4 text-left">
            <Feature text="All templates access" />
            <Feature text="Unlimited edits & downloads" />
            <Feature text="Priority support" />
            <Feature text="No APAAR verification required" />
          </div>

          {/* CTA (same pattern as student professional card) */}
          <button
            onClick={handlePayment}
            className="mt-8 w-full rounded-full bg-blue-700 py-3.5 text-[15px] font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Pay ₹99 & Continue
          </button>

          {/* Bottom note */}
          <p className="mt-3 text-[12px] text-gray-400">
            After payment, you’ll be redirected to your dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}

/* Feature Row */
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