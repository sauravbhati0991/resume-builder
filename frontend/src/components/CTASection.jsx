import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"
      aria-labelledby="cta-heading"
    >
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Heading */}
        <h2
          id="cta-heading"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
        >
          Ready to Create Your Perfect Resume?
        </h2>

        {/* Subheading */}
        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 opacity-90">
          Join thousands of students and professionals who trust RESUMEA
        </p>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="
            inline-flex items-center gap-2 sm:gap-3
            bg-white text-black font-semibold
            px-6 sm:px-7 lg:px-8
            py-3 sm:py-3.5 lg:py-4
            rounded-xl
            text-sm sm:text-base
            shadow-lg hover:shadow-2xl
            transition-transform
          "
          aria-label="Start building your resume"
        >
          Start Building Now
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default CTASection;