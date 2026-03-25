import { LayoutGrid, IndianRupee, MapPin, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const DashboardNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /* =============================
     Detect User Area
  ============================== */

  const isStudent = location.pathname.startsWith("/stu");
  const isPro = location.pathname.startsWith("/pro");

  const base = isStudent ? "/stu" : isPro ? "/pro" : "/";

  const dashboardPath = base;
  const templatesPath = `${base}/templates`;
  const pricingPath = `${base}/pricing`;
  const printCentersPath = `${base}/print-centers`;

  /* =============================
     Logout
  ============================== */

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 lg:h-20 flex items-center justify-between"
      >
        {/* Logo */}
        <Link to={dashboardPath}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-gray-900">
              RESUME<span className="text-blue-600">A</span>
            </span>
          </motion.div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavItem
            to={dashboardPath}
            icon={<LayoutGrid size={18} />}
            label="Dashboard"
            active={location.pathname === dashboardPath}
          />

          <NavItem
            to={templatesPath}
            icon={<LayoutGrid size={18} />}
            label="Templates"
            active={location.pathname.startsWith(templatesPath)}
          />

          <NavItem
            to={pricingPath}
            icon={<IndianRupee size={18} />}
            label="Pricing"
            active={location.pathname.startsWith(pricingPath)}
          />

          <NavItem
            to={printCentersPath}
            icon={<MapPin size={18} />}
            label="Print Centers"
            active={location.pathname.startsWith(printCentersPath)}
          />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onLogout}
            className="text-sm sm:text-base font-medium text-gray-700 hover:text-black"
          >
            Logout
          </motion.button>

          <Link to={dashboardPath}>
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition"
            >
              My Documents
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </header>
  );
};

const NavItem = ({ icon, label, to, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex items-center gap-2 text-sm sm:text-base font-medium cursor-pointer
        ${active ? "text-blue-600" : "text-gray-600 hover:text-black"}
      `}
    >
      {icon}
      {label}
    </motion.div>
  </Link>
);

export default DashboardNavbar;