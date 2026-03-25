import { useState, useEffect, useRef } from "react";
import { Home, LayoutGrid, IndianRupee, FileText, User, LogOut, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for Auth & Dropdown
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Check Login Status on Mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // 2. Handle Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Logout Handler
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const getInitials = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 lg:h-20 flex items-center justify-between"
      >

        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
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
          <NavItem to="/" icon={<Home size={18} />} label="Home" active={location.pathname === "/"} />
          <NavItem to="/templates" icon={<LayoutGrid size={18} />} label="Templates" active={location.pathname === "/templates"} />
          <NavItem to="/pricing" icon={<IndianRupee size={18} />} label="Pricing" active={location.pathname === "/pricing"} />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {getInitials()}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">
                    {user.fullName || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500">Student</p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <DropdownItem
                      to="/dashboard"
                      icon={<LayoutDashboard size={16} />}
                      label="Dashboard"
                      onClick={() => setShowDropdown(false)}
                    />

                    <DropdownItem
                      to="/settings"
                      icon={<Settings size={16} />}
                      label="Settings"
                      onClick={() => setShowDropdown(false)}
                    />

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-sm sm:text-base font-medium text-gray-700 hover:text-black"
                >
                  Login
                </motion.button>
              </Link>

              <Link to="/onboarding/intro">
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </header>
  );
};


const NavItem = ({ icon, label, to, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`flex items-center gap-2 text-sm sm:text-base font-medium cursor-pointer ${
        active ? "text-blue-600" : "text-gray-600 hover:text-black"
      }`}
    >
      {icon}
      {label}
    </motion.div>
  </Link>
);

const DropdownItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
  >
    <span className="text-gray-400">{icon}</span>
    {label}
  </Link>
);

export default Navbar;