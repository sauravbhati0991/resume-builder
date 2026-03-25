import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">

        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
        >

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>

              <span className="text-xl sm:text-2xl font-bold text-white">
                RESUME<span className="text-blue-500">A</span>
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed text-sm sm:text-base max-w-sm">
              Making professional resume creation accessible for everyone
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Footer Product Links">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Product
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <motion.li
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link to="/templates" className="hover:text-white transition">
                  Templates
                </Link>
              </motion.li>

              <motion.li
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link to="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </motion.li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Footer Company Links">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Company
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <motion.li
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <a href="/#about" className="hover:text-white transition">
                  About
                </a>
              </motion.li>

              <motion.li
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </motion.li>
            </ul>
          </nav>

        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-slate-800 mt-10 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 text-center"
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} RESUMEA. All rights reserved.
          </p>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;