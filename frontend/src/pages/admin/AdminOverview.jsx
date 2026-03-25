// src/pages/admin/AdminOverview.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Users, IndianRupee, Grid, Layers } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Stats load failed", err))
      .finally(() => setLoading(false));
  }, []);

  const skeleton = <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />;

  const totalUsers = stats?.totalUsers ?? 0;
  const students = stats?.userStats?.students ?? 0;
  const professionals = stats?.userStats?.professionals ?? 0;

  const templatesTotal = stats?.templateStats?.total ?? 0;
  const paid = stats?.templateStats?.paid ?? 0;
  const free = stats?.templateStats?.free ?? 0;

  // ✅ NEW: categories count (expects backend to return this)
  const totalCategories = stats?.categoryStats?.total ?? stats?.totalCategories ?? 0;

  const statCards = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users className="text-blue-600" />,
      sub: `${students} Students • ${professionals} Professionals`,
    },
    // {
    //   label: "Categories",
    //   value: totalCategories,
    //   icon: <Layers className="text-indigo-600" />,
    //   sub: "Total template categories",
    // },
    {
      label: "Templates",
      value: templatesTotal,
      icon: <Grid className="text-orange-600" />,
      sub: `${paid} Paid • ${free} Free`,
    },
    {
      label: "Revenue",
      value: stats?.revenue ?? "₹0",
      icon: <IndianRupee className="text-green-600" />,
      sub: "Total Earnings",
    },
  ];

  return (
    <div className="mb-12">
      {/* ✅ Heading text */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Hey Admin 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here’s the complete overview of your RESUMEA platform right now.
        </p>
      </div>

      {/* ✅ Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
              <div className="p-2 bg-gray-50 rounded-lg">{s.icon}</div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? skeleton : s.value}
            </h2>

            {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}