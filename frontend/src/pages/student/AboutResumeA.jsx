import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  TrendingUp,
  FileText,
  Sparkles,
  Award,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI Resume Assistant",
    desc: "Our AI analyzes your resume and suggests improvements to strengthen your profile.",
    color: "text-blue-600",
  },
  {
    icon: Shield,
    title: "Student Friendly Pricing",
    desc: "Students can build resumes for just ₹10 or completely free with APAAR ID verification.",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Unique CV Number",
    desc: "Every resume receives a unique CV number so you can update and access it anytime.",
    color: "text-purple-600",
  },
  {
    icon: FileText,
    title: "Professional Templates",
    desc: "Choose from professionally designed templates suitable for every industry.",
    color: "text-pink-600",
  },
  {
    icon: Sparkles,
    title: "Real-Time Preview",
    desc: "Instantly see your resume update while editing.",
    color: "text-orange-600",
  },
  {
    icon: Award,
    title: "ATS Optimized",
    desc: "Resumes structured to pass modern Applicant Tracking Systems.",
    color: "text-cyan-600",
  },
];

export default function AboutResumeA() {
  return (
    <section className="bg-[#F7FBFF] min-h-screen py-16 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About <span className="text-blue-600">ResumeA</span>
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">
            ResumeA helps students and professionals create powerful,
            ATS-optimized resumes quickly using AI assistance and
            professionally designed templates.
          </p>
        </motion.header>

        {/* FEATURES */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition"
              >
                <Icon className={`w-8 h-8 mb-4 ${item.color}`} />

                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}

        </div>

        {/* TRUST SECTION */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm mb-2 tracking-widest">
            RECOGNIZED BY
          </p>

          <img
            src="/startup-india-dpiit.png"
            alt="Startup India DPIIT recognition"
            className="mx-auto w-[110px] sm:w-[140px] opacity-80"
          />
        </motion.footer>

      </div>
    </section>
  );
}