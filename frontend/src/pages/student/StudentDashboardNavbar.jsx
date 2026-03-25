import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function StudentDashboardNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =============================
     Get User + Onboarding Safely
  ============================== */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const onboarding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const name = user?.fullName || onboarding?.fullName || "Student";
  const initial = (name?.trim()?.[0] || "S").toUpperCase();

  /* =============================
     Active Route Logic
  ============================== */
  const isActive = (path) => {
    if (path === "/stu") {
      return location.pathname === "/stu";
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

  const navLinkClass = (path) =>
    [
      "px-4 py-2 rounded-full text-sm font-semibold transition",
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-3 flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <Link to="/stu" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold">
            R
          </div>

          <div className="leading-tight">
            <div className="text-sm font-extrabold text-gray-900">
              RESUMEA
            </div>
            <div className="text-[11px] text-gray-500 -mt-0.5">
              Student
            </div>
          </div>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden md:flex items-center gap-2">

          <Link to="/stu" className={navLinkClass("/stu")}>
            Dashboard
          </Link>

          <Link to="/stu/about" className={navLinkClass("/stu/about")}>
            About
          </Link>

          <Link to="/stu/templates" className={navLinkClass("/stu/templates")}>
            Templates
          </Link>

          <Link to="/stu/pricing" className={navLinkClass("/stu/pricing")}>
            Pricing
          </Link>

          <Link to="/stu/print-centers" className={navLinkClass("/stu/print-centers")}>
            Print Centers
          </Link>

          <Link to="/stu/contact" className={navLinkClass("/stu/contact")}>
            Contact
          </Link>

        </nav>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="hidden sm:flex h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white items-center justify-center font-extrabold">
            {initial}
          </div>

          {/* Logout */}
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

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4">

          <div className="flex flex-col gap-2 pt-3">

            <Link to="/stu" className={navLinkClass("/stu")} onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>

            <Link to="/stu/about" className={navLinkClass("/stu/about")} onClick={() => setMobileOpen(false)}>
              About
            </Link>

            <Link to="/stu/templates" className={navLinkClass("/stu/templates")} onClick={() => setMobileOpen(false)}>
              Templates
            </Link>

            <Link to="/stu/pricing" className={navLinkClass("/stu/pricing")} onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>

            <Link to="/stu/print-centers" className={navLinkClass("/stu/print-centers")} onClick={() => setMobileOpen(false)}>
              Print Centers
            </Link>

            <Link to="/stu/contact" className={navLinkClass("/stu/contact")} onClick={() => setMobileOpen(false)}>
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