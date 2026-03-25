import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";
import api from "../../utils/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => { 
    return email.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [email, password, loading]);

  const tryLogin = async (path) => {
    // api here is your axios instance (baseURL already set in utils/api.js)
    return api.post(path, {
      email: email.trim(),
      password,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ Try new standard route first
      let res;
      try {
        res = await tryLogin("/api/admin/login");
      } catch (err) {
        // If backend is mounted at /admin instead of /api/admin
        const status = err?.response?.status;
        if (status === 404) {
          res = await tryLogin("/admin/login");
        } else {
          throw err;
        }
      }

      const token = res?.data?.token;
      if (!token) {
        setError("Login succeeded but token missing (check backend response).");
        return;
      }

      localStorage.setItem("adminToken", token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Invalid admin credentials" : null) ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050B1E] via-[#0A1440] to-[#050B1E] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-10"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
            <ShieldCheck className="text-blue-400" size={28} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            RESUMEA <span className="text-blue-400">Admin</span>
          </h1>

          <p className="text-sm text-gray-400 mt-2 text-center">
            Elevated controls for site administrators
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              autoComplete="email"
              placeholder="Admin Email"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Security Key"
              className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={canSubmit ? { scale: 1.03 } : undefined}
            whileTap={canSubmit ? { scale: 0.97 } : undefined}
            disabled={!canSubmit}
            className={[
              "w-full py-3 rounded-lg font-semibold shadow-lg transition",
              canSubmit
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-600/40 text-white/70 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Authenticating..." : "Access Admin Dashboard"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Admin access only • Unauthorized access prohibited
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;