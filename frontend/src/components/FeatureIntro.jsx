import { motion } from "framer-motion";

const FeatureIntro = () => {
  return (
    <section
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center"
      aria-labelledby="feature-intro-heading"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">

          {/* LEFT – IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop"
                alt="Resume builder interface showing professional resume creation"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10" />
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08 }}
              className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
            >
              AI-Powered
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08 }}
              className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
            >
              ATS-Friendly
            </motion.div>
          </motion.div>

          {/* RIGHT – TEXT */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2
              id="feature-intro-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-gray-900"
            >
              Transform Your Career
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
              Professional, ATS-optimized resumes that get noticed.
            </p>

            <div className="space-y-5 sm:space-y-6 max-w-lg mx-auto">

              {/* Bullet 1 */}
              <motion.div whileHover={{ x: 6 }}>
                <div className="flex items-center gap-3 mb-1 justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Smart AI Assistance
                  </h4>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Intelligent content suggestions.
                </p>
              </motion.div>

              {/* Bullet 2 */}
              <motion.div whileHover={{ x: 6 }}>
                <div className="flex items-center gap-3 mb-1 justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Professional Templates
                  </h4>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  10+ premium templates.
                </p>
              </motion.div>

              {/* Bullet 3 */}
              <motion.div whileHover={{ x: 6 }}>
                <div className="flex items-center gap-3 mb-1 justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Instant Download
                  </h4>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Export to PDF instantly.
                </p>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeatureIntro;