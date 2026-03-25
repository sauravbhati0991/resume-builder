import {
  LayoutDashboard,
  Users,
  Grid,
  IndianRupee,
  Layers,
  LogOut,
  Settings,
  NotebookPen,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ onLogout }) => {
  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between h-screen fixed left-0 top-0 z-50">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="px-6 py-6 text-2xl font-bold">
          Resume<span className="text-blue-400">A</span>
          <div className="text-xs text-gray-400 mt-1">Admin Panel</div>
        </div>

        {/* MAIN MENU */}
        <div className="px-3">
          <p className="text-xs text-gray-500 uppercase px-3 mb-2">Main Menu</p>

          <nav className="space-y-1">
            <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />}>
              Overview
            </NavItem>

            <NavItem to="/admin/dashboard/users" icon={<Users size={18} />}>
              User Management
            </NavItem>

            <NavItem to="/admin/dashboard/templates" icon={<Grid size={18} />}>
              Templates
            </NavItem>

            <NavItem to="/admin/dashboard/categories" icon={<Layers size={18} />}>
              Categories
            </NavItem>

            {/* ✅ NEW: BLOGS */}
            <NavItem to="/admin/dashboard/blogs" icon={<NotebookPen size={18} />}>
              Blogs
            </NavItem>

            <NavItem
              to="/admin/dashboard/transactions"
              icon={<IndianRupee size={18} />}
            >
              Transactions
            </NavItem>
          </nav>
        </div>

        {/* SYSTEM */}
        <div className="px-3 mt-6">
          <p className="text-xs text-gray-500 uppercase px-3 mb-2">System</p>

          <nav className="space-y-1">
            <NavItem to="/admin/dashboard/settings" icon={<Settings size={18} />}>
              Settings
            </NavItem>
          </nav>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">● System Online</p>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition
       ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}`
    }
  >
    {icon}
    {children}
  </NavLink>
);

export default AdminSidebar;