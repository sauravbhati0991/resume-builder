import {
  Zap,
  Shield,
  TrendingUp,
  FileText,
  Sparkles,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Assistant",
    desc: "Our AI analyzes, improves, and optimizes your resume content with actionable suggestions",
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    icon: Shield,
    title: "Student Friendly",
    desc: "Just ₹10 for students, or FREE with APAAR ID verification. We make it affordable for everyone",
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Unique CV Tracking",
    desc: "Every resume gets a unique CV number. Login anytime to update and download your resume",
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    icon: FileText,
    title: "10+ Premium Templates",
    desc: "Choose from professionally designed templates that work for any industry",
    bg: "bg-pink-100",
    color: "text-pink-600",
  },
  {
    icon: Sparkles,
    title: "Real-Time Preview",
    desc: "See your changes instantly with live preview as you build your resume",
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    icon: Award,
    title: "ATS Optimized",
    desc: "All templates are optimized to pass Applicant Tracking Systems",
    bg: "bg-cyan-100",
    color: "text-cyan-600",
  },
];

const WhyChooseResumeA = () => {
  return (
    <section
      className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 py-16 sm:py-20 lg:py-24"
      aria-labelledby="why-choose-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2
            id="why-choose-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-3"
          >
            Why Choose <span className="text-black">RESUMEA</span>?
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-black/70">
            Everything you need to create a winning resume
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                whileHover={{ y: -10 }}
                className="
                  rounded-2xl border border-gray-200 bg-white
                  p-6 sm:p-7 lg:p-8
                  transition-all duration-300 ease-out
                  hover:shadow-2xl
                "
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-5 sm:mb-6 ${item.bg}`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </motion.div>

                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-black">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm lg:text-sm text-black/70 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseResumeA;