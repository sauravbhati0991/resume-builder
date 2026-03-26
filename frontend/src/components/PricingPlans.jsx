import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingPlans = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-14">
        
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-[22px] sm:text-[26px] md:text-[32px] lg:text-[36px] font-extrabold text-gray-900">
            Affordable Pricing for Everyone
          </h1>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-500">
            Choose the plan that works for you
          </p>
        </div>

        {/* Cards */}
        <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          
          {/* STUDENTS */}
          <div className="rounded-2xl border-2 border-blue-400/70 bg-white shadow-lg overflow-hidden">
            <div className="p-5 sm:p-6 md:p-8">
              
              <div className="text-center">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  Students
                </h2>

                <div className="mt-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600">
                    ₹10
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  or <span className="font-semibold">FREE</span> with APAAR ID
                </p>
              </div>

              <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                <Feature>All templates</Feature>
                <Feature>AI assistance</Feature>
                <Feature>Lifetime access</Feature>
              </ul>

              <button
                onClick={() => navigate("/payment", { state: { amount: 10, planName: "Student" } })}
                className="mt-6 sm:mt-8 w-full bg-black text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:opacity-95 transition"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* PROFESSIONALS */}
          <div className="rounded-2xl border border-gray-300 bg-white shadow-lg overflow-hidden">
            <div className="p-5 sm:p-6 md:p-8">

              <div className="text-center">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  Professionals
                </h2>

                <div className="mt-2 flex justify-center items-end gap-1">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                    ₹99
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 pb-1">
                    /year
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  After 5 free sessions
                </p>
              </div>

              <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                <Feature>All templates</Feature>
                <Feature>Unlimited updates</Feature>
                <Feature>Priority support</Feature>
              </ul>

              <button
                onClick={() => navigate("/payment", { state: { amount: 99, planName: "Professional" } })}
                className="mt-6 sm:mt-8 w-full border border-gray-400 bg-white text-gray-800 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition"
              >
                Get Started
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingPlans;

/* Feature row */
function Feature({ children }) {
  return (
    <li className="flex items-center gap-2 sm:gap-3">
      <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
      </span>
      {children}
    </li>
  );
}