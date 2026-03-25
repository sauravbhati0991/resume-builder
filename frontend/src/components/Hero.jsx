import { motion } from "framer-motion";
import ResumeCarousel from "./ResumeCarousel";

const Hero = () => {
  return (
    <section
      className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center w-full">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full mb-4 sm:mb-6"
          >
            AI-Powered Resume Builder
          </motion.span>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
          >
            Craft Your Perfect <br />
            Resume in <span className="text-blue-600">Minutes</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-xl">
            "Your next opportunity starts with a resume that stands out.
            Let AI help you shine."
          </p>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 max-w-xl">
            Professional templates, AI assistance, and affordable pricing for
            students and professionals. Start for ₹10 or free with your APAAR ID.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition"
              aria-label="Create resume now"
            >
              Create Resume Now ⚡
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-gray-300 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium bg-white hover:shadow-md transition"
              aria-label="View resume templates"
            >
              View Templates
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10 lg:mt-0"
        >
          <ResumeCarousel />
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;