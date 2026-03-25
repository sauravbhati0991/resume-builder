// src/pages/admin/AdminUsers.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { Users, GraduationCap, Briefcase, RefreshCcw } from "lucide-react";

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setErr("");
    try {
      // ✅ must match backend: app.use("/api/admin", adminRoutes)
      // and admin.routes.js has: router.get("/stats", adminAuth, getDashboardStats)
      const res = await api.get("/admin/stats");
      setStats(res.data || {});
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch user stats"
      );
      setStats(null);
      console.error("AdminUsers stats error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUsers = useMemo(() => stats?.totalUsers ?? 0, [stats]);
  const students = useMemo(() => stats?.userStats?.students ?? 0, [stats]);
  const professionals = useMemo(
    () => stats?.userStats?.professionals ?? 0,
    [stats]
  );

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">User Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Breakdown of signups by account type (Student vs Professional).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {err && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
          <div className="mt-2 text-xs text-red-600">
            Tip: Open DevTools → Network → check <b>/api/admin/stats</b> status (401/404/500).
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      )}

      {/* Content */}
      {!loading && !err && (
        <>
          {/* Top cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Users"
              value={totalUsers}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Students"
              value={students}
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <StatCard
              label="Professionals"
              value={professionals}
              icon={<Briefcase className="h-5 w-5" />}
            />
          </div>

          {/* Breakdown table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-gray-600">
                    Count
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-gray-600">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <Row
                  label="Students"
                  count={students}
                  total={totalUsers}
                />
                <Row
                  label="Professionals"
                  count={professionals}
                  total={totalUsers}
                />
                <Row
                  label="All Users"
                  count={totalUsers}
                  total={totalUsers}
                  bold
                />
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function Row({ label, count, total, bold = false }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <tr className={bold ? "bg-white" : "bg-white"}>
      <td className={`px-4 py-3 ${bold ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>
        {label}
      </td>
      <td className={`px-4 py-3 text-right ${bold ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>
        {count}
      </td>
      <td className="px-4 py-3 text-right text-gray-500">
        {bold ? "100%" : `${pct}%`}
      </td>
    </tr>
  );
}