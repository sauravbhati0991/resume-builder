import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { Users, GraduationCap, Briefcase, RefreshCcw, ChevronDown, ChevronUp, ShieldCheck, School, BookOpen, Fingerprint, Calendar, User } from "lucide-react";

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

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
      u.email.toLowerCase().includes(s) ||
      (u.apaarId && u.apaarId.toLowerCase().includes(s))
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* ... existing stats section ... */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">Manage Users</h3>
            <div className="relative max-w-xs w-full">
              <input 
                type="text" 
                placeholder="Search by name, email, or APAAR ID..."
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
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">Verification Status</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">Joined Date</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-[11px]">Plan Expiry</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5 min-w-[200px]"><div className="h-4 bg-gray-100 rounded w-3/4"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-1/3"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <React.Fragment key={u.id}>
                      <tr 
                        onClick={() => toggleExpand(u.id)}
                        className={`transition-colors cursor-pointer ${
                          expandedUserId === u.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                        }`}
                      >
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
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            u.verificationStatus === 'VERIFIED' 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-gray-50 text-gray-400 border border-gray-100'
                          }`}>
                            {u.verificationStatus || 'NONE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {u.subscriptionExpiry ? (
                            <span className="text-emerald-600 font-bold whitespace-nowrap">
                              {new Date(u.subscriptionExpiry).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-300">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {expandedUserId === u.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </td>
                      </tr>

                      {/* Expandable Detail View */}
                      {expandedUserId === u.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-0 pb-6 bg-blue-50/50 border-b border-blue-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                              {u.verificationStatus === 'VERIFIED' ? (
                                <>
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-green-50">
                                      <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Identity</p>
                                      <p className="font-bold text-gray-900 leading-tight">
                                        {u.verifiedName || u.name}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-red-50">
                                      <Calendar className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
                                      <p className="text-xs font-semibold text-gray-700 leading-tight">
                                        {(() => {
                                          const dob = u.verifiedDob;
                                          if (!dob) return 'N/A';
                                          // Format continuous 8-digit strings (DDMMYYYY -> DD/MM/YYYY)
                                          if (dob.length === 8 && !dob.includes('-') && !dob.includes('/')) {
                                            return `${dob.slice(0, 2)}/${dob.slice(2, 4)}/${dob.slice(4)}`;
                                          }
                                          return dob;
                                        })()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-orange-50">
                                      <User className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                                      <p className="text-xs font-semibold text-gray-700 leading-tight capitalize">
                                        {u.verifiedGender === 'M' ? 'Male' : u.verifiedGender === 'F' ? 'Female' : (u.verifiedGender || 'N/A')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-blue-50">
                                      <School className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institution</p>
                                      <p className="text-xs font-semibold text-gray-700 leading-tight">
                                        {u.verifiedInstitution || 'Official Linked College'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-50">
                                      <BookOpen className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course / Program</p>
                                      <p className="text-xs font-semibold text-gray-700 leading-tight">
                                        {u.verifiedCourse || 'Student Enrollment'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-indigo-50">
                                      <RefreshCcw className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DigiLocker ID</p>
                                      <p className="text-[13px] font-black text-gray-900 tracking-wider">
                                        {u.verifiedDigilockerId || u.apaarId || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-start gap-3 col-span-3">
                                  <div className="p-2 rounded-xl bg-purple-50">
                                    <Fingerprint className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search Reference (Unverified)</p>
                                    <p className="font-black text-gray-900 tracking-wider">
                                      {u.apaarId || 'Not Linked'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">
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