import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProPricing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Later integrate payment
    navigate("/pro/payment");
  };

  return (
    <section className="min-h-screen bg-[#F7FBFF] flex flex-col items-center px-4 pt-14 pb-10">

      {/* Heading (outside card like student pricing) */}
      <div className="text-center mb-8 -translate-y-2">
        <h1 className="text-[26px] sm:text-[30px] font-extrabold text-gray-900">
          Affordable Pricing
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          Upgrade your resume experience with premium tools.
        </p>
      </div>

      {/* SAME CARD SIZE AS STUDENT */}
      <div className="w-full max-w-[420px]">
        <div
          className="
            rounded-[26px]
            border-2 border-blue-300/70
            bg-white
            shadow-2xl
            ring-1 ring-blue-100/40
            px-8 py-10
            text-center
          "
        >
          {/* Plan Title */}
          <h2 className="text-[22px] font-extrabold text-gray-900">
            Professionals
          </h2>

          {/* Price */}
          <div className="mt-4">
            <span className="text-[48px] font-extrabold text-gray-900">
              ₹99
            </span>
            <span className="text-gray-500 text-lg ml-1">/year</span>
          </div>

          {/* Subtext */}
          <p className="mt-2 text-gray-400 text-sm">
            After 5 free sessions
          </p>

          {/* Features */}
          <div className="mt-6 space-y-4 text-left max-w-[240px] mx-auto">

            <Feature text="All templates access" />
            <Feature text="Unlimited updates" />
            <Feature text="Priority support" />

          </div>

          {/* CTA — SAME BLACK BUTTON */}
          <button
            onClick={handleGetStarted}
            className="
              mt-8
              w-full
              rounded-full
              bg-black
              py-3
              text-white
              font-bold
              shadow-lg
              hover:bg-gray-900
              transition
            "
          >
            Get Started
          </button>
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

      <span className="text-gray-700 text-[14px] font-medium">
        {text}
      </span>

    </div>
  );
}