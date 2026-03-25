import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function ProfessionalDashboardNavbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =============================
     Get User Safely
  ============================== */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const name = user?.fullName || user?.name || "Professional";
  const initial = (name?.trim()?.[0] || "P").toUpperCase();

  /* =============================
     Active Route Helper
  ============================== */
  const isActive = (path) => {
    if (path === "/pro") {
      return location.pathname === "/pro";
    }
    return location.pathname.startsWith(path);
  };

  /* =============================
     Logout
  ============================== */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("onboarding");
    navigate("/login", { replace: true });
  };

  const navClass = (path) =>
    [
      "px-4 py-2 rounded-full text-sm font-semibold transition",
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">

      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/pro" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold">
            R
          </div>

          <div className="leading-tight">
            <div className="text-sm font-extrabold text-gray-900">
              RESUMEA
            </div>
            <div className="text-[11px] text-gray-500 -mt-0.5">
              Professional
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-2">

          <Link to="/pro" className={navClass("/pro")}>
            Dashboard
          </Link>

          <Link to="/pro/about" className={navClass("/pro/about")}>
            About
          </Link>

          <Link to="/pro/templates" className={navClass("/pro/templates")}>
            Templates
          </Link>

          <Link to="/pro/pricing" className={navClass("/pro/pricing")}>
            Pricing
          </Link>

          <Link to="/pro/print-centers" className={navClass("/pro/print-centers")}>
            Print Centers
          </Link>

          <Link to="/pro/contact" className={navClass("/pro/contact")}>
            Contact
          </Link>

        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="hidden sm:flex h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white items-center justify-center font-extrabold">
            {initial}
          </div>

          {/* Logout Desktop */}
          <button
            onClick={logout}
            className="hidden md:block h-10 px-4 rounded-full bg-[#0B1733] text-white text-sm font-bold hover:bg-[#071028] transition"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4">

          <div className="flex flex-col gap-2 pt-3">

            <Link to="/pro" className={navClass("/pro")} onClick={()=>setMobileOpen(false)}>
              Dashboard
            </Link>

            <Link to="/pro/about" className={navClass("/pro/about")} onClick={()=>setMobileOpen(false)}>
              About
            </Link>

            <Link to="/pro/templates" className={navClass("/pro/templates")} onClick={()=>setMobileOpen(false)}>
              Templates
            </Link>

            <Link to="/pro/pricing" className={navClass("/pro/pricing")} onClick={()=>setMobileOpen(false)}>
              Pricing
            </Link>

            <Link to="/pro/print-centers" className={navClass("/pro/print-centers")} onClick={()=>setMobileOpen(false)}>
              Print Centers
            </Link>

            <Link to="/pro/contact" className={navClass("/pro/contact")} onClick={()=>setMobileOpen(false)}>
              Contact
            </Link>

            <button
              onClick={logout}
              className="mt-3 w-full h-10 rounded-full bg-[#0B1733] text-white text-sm font-bold hover:bg-[#071028]"
            >
              Logout
            </button>

          </div>

        </div>
      )}
    </header>
  );
}