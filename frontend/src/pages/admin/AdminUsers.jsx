// src/pages/admin/AdminUsers.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { Users, GraduationCap, Briefcase, RefreshCcw } from "lucide-react";

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users")
      ]);
      setStats(statsRes.data || {});
      setUsers(usersRes.data || []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch user data"
      );
      console.error("AdminUsers fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUsers = useMemo(() => stats?.totalUsers ?? 0, [stats]);
  const students = useMemo(() => stats?.userStats?.students ?? 0, [stats]);
  const professionals = useMemo(
    () => stats?.userStats?.professionals ?? 0,
    [stats]
  );

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">User Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">
              General breakdown of signups.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Error */}
        {err && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

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
      </div>

      {/* DETAILED USER LIST */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">Manage Users</h3>
            <div className="relative max-w-xs w-full">
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">User Details</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">Account Type</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5 min-w-[200px]"><div className="h-4 bg-gray-100 rounded w-3/4"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{u.name}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          u.accountType === 'student' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-400 font-medium">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
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