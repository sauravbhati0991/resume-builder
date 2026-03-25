import { FileText, Edit3, Download } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "1",
    icon: FileText,
    title: "Choose Template",
    desc: "Browse and select from our collection of professional, ATS-optimized resume templates",
    bg: "bg-blue-500",
  },
  {
    step: "2",
    icon: Edit3,
    title: "Fill in Your Details",
    desc: "Easily input your information with our intuitive form and AI-powered suggestions",
    bg: "bg-pink-500",
    highlight: true,
  },
  {
    step: "3",
    icon: Download,
    title: "Download & Share",
    desc: "Download your resume as PDF or share it directly with potential employers",
    bg: "bg-orange-500",
  },
];

const HowItWorks = () => {
  return (
    <section
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-blue-50 via-white to-cyan-50"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Heading */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full bg-blue-100 text-blue-600 font-medium"
        >
          Simple 3-Step Process
        </motion.span>

        <motion.h2
          id="how-it-works-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2 sm:mb-3"
        >
          How It Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-sm sm:text-base mb-10 sm:mb-12 lg:mb-16"
        >
          Create a professional resume in minutes with our easy-to-use platform
        </motion.p>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">

          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-blue-200 -z-0" />

          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className={`relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm transition
                  hover:shadow-xl
                  ${item.highlight ? "shadow-xl" : ""}
                `}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl flex items-center justify-center text-white mb-5 sm:mb-6 ${item.bg}`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </motion.div>

                {/* Step Number */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-600 text-white text-xs sm:text-sm flex items-center justify-center font-semibold">
                  {item.step}
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">
                  {item.title}
                </h3>

                <p className="text-black/70 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-14 lg:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-6 sm:px-7 lg:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium inline-flex items-center gap-2 hover:bg-gray-900 transition"
            aria-label="Get started for free"
          >
            Get Started for Free →
          </motion.button>

          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;