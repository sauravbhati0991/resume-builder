import { Check } from "lucide-react";
import { motion } from "framer-motion";

const Pricing = () => {
  return (
    <section
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Heading */}
        <motion.h2
          id="pricing-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-3"
        >
          Affordable Pricing for Everyone
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base lg:text-lg text-black/70 mb-10 sm:mb-12 lg:mb-16"
        >
          Choose the plan that works for you
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">

          {/* Students */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="border-2 border-blue-500 rounded-2xl p-6 sm:p-8 lg:p-10 text-left shadow-lg"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-black mb-2">
              Students
            </h3>

            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
              ₹10
            </div>

            <p className="text-xs sm:text-sm text-black/70 mb-6 sm:mb-8">
              or FREE with APAAR ID
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {[
                "All templates",
                "AI assistance",
                "Lifetime access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-sm sm:text-base text-black">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-900 transition"
              aria-label="Get started with student plan"
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Professionals */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -8 }}
            className="border border-gray-200 rounded-2xl p-6 sm:p-8 lg:p-10 text-left shadow-sm hover:shadow-lg transition"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-black mb-2">
              Professionals
            </h3>

            <div className="text-3xl sm:text-4xl font-bold text-black mb-1">
              ₹99<span className="text-sm sm:text-lg font-medium">/year</span>
            </div>

            <p className="text-xs sm:text-sm text-black/70 mb-6 sm:mb-8">
              After 5 free sessions
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {[
                "All templates",
                "Unlimited updates",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-sm sm:text-base text-black">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full border border-gray-300 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition"
              aria-label="Get started with professional plan"
            >
              Get Started
            </motion.button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;