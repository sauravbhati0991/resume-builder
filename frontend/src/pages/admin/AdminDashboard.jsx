// src/pages/admin/AdminDashboard.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Components
import AdminSidebar from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import AdminAddCategory from "./AdminAddCategory";
import AdminAddTemplate from "./AdminAddTemplate";
import AdminTemplateList from "./AdminTemplateList";

// ✅ REAL MODULES
import AdminUsers from "./AdminUsers";
import AdminBlogs from "./AdminBlogs"; // ✅ ADD THIS

// --- PLACEHOLDER COMPONENTS ---
const AdminResumes = () => (
  <div className="p-10 bg-white rounded shadow text-gray-500">
    Resume Assets Module (Coming Soon)
  </div>
);
const AdminTransactions = () => (
  <div className="p-10 bg-white rounded shadow text-gray-500">
    Transactions Module (Coming Soon)
  </div>
);
const AdminSettings = () => (
  <div className="p-10 bg-white rounded shadow text-gray-500">
    Settings Module (Coming Soon)
  </div>
);
// -----------------------------

const TemplatesSection = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  return (
    <div className="space-y-8">
      <AdminAddTemplate onCategoryChange={setSelectedCategoryId} />

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Manage Existing Templates
        </h2>
        <AdminTemplateList categoryId={selectedCategoryId} />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <Routes>
          {/* DEFAULT: OVERVIEW */}
          <Route
            index
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Dashboard Overview
                </h1>
                <AdminOverview />
              </>
            }
          />

          {/* USER MANAGEMENT */}
          <Route
            path="users"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  User Analytics
                </h1>
                <AdminUsers />
              </>
            }
          />

          {/* ✅ BLOGS */}
          <Route
            path="blogs"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Blogs
                </h1>
                <AdminBlogs />
              </>
            }
          />

          {/* RESUME ASSETS */}
          <Route
            path="resumes"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Resume Assets
                </h1>
                <AdminResumes />
              </>
            }
          />

          {/* TRANSACTIONS */}
          <Route
            path="transactions"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Transactions
                </h1>
                <AdminTransactions />
              </>
            }
          />

          {/* CATEGORIES */}
          <Route
            path="categories"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Category Management
                </h1>
                <AdminAddCategory />
              </>
            }
          />

          {/* TEMPLATES */}
          <Route
            path="templates"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Template Management
                </h1>
                <TemplatesSection />
              </>
            }
          />

          {/* SETTINGS */}
          <Route
            path="settings"
            element={
              <>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                  Settings
                </h1>
                <AdminSettings />
              </>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;