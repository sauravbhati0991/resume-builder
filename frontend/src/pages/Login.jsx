import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../utils/api";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const navigate = useNavigate();

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => email.trim() && password.trim(),
    [email, password],
  );

  // ✅ decide route ONLY from DB truth (/users/me)
  const decideRoute = (me) => {
    const t = String(me?.onboarding?.accountType || "").toLowerCase();
    if (t === "professional") return "/pro";
    if (t === "student") return "/stu";

    const isStudent = me?.onboarding?.isStudent;
    if (typeof isStudent === "boolean") return isStudent ? "/stu" : "/pro";

    return "/dashboard-gate";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    try {
      setLoading(true);

      // ✅ normal login: backend must return { token }
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = res?.data?.token;
      if (!token) {
        throw new Error("Login failed: token missing from server response");
      }

      localStorage.setItem("userToken", token);

      // ✅ fetch latest user from DB
      const meRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const me = meRes?.data || {};
      localStorage.setItem("user", JSON.stringify(me));
      localStorage.setItem("onboarding", JSON.stringify(me?.onboarding || {}));

      navigate(decideRoute(me), { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login — Resume Builder</title>
        <meta
          name="description"
          content="Login to your Resume Builder account and access your dashboard."
        />
      </Helmet>

      <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
          <div className="absolute top-24 right-[-140px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
          <div className="absolute bottom-[-220px] left-[-160px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-[0_10px_40px_-8px_rgba(37,99,235,0.25)] border-2 border-blue-200/60 ring-1 ring-blue-100/40 overflow-hidden">
            <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="p-6 sm:p-8 lg:p-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-gray-900">
                Welcome Back
              </h1>

              <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 tracking-wide">
                Login with your email and password
              </p>

              <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider">
                    EMAIL
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F3F7FF] border border-[#C7D9FF] px-4 py-3 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 tracking-wider">
                    PASSWORD
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F3F7FF] border border-[#C7D9FF] px-4 py-3 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-blue-500">
                  <div
                    onClick={() => navigate("/forgot-password")}
                    className="cursor-pointer w-fit hover:underline"
                  >
                    Forgot Password
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={[
                    "w-full rounded-xl text-white font-bold py-3 shadow-lg transition flex items-center justify-center gap-2",
                    canSubmit && !loading
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-blue-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Login <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-sm text-gray-600">New here?</span>
                <Link
                  to="/onboarding/intro"
                  className="ml-2 inline-block text-sm sm:text-base font-extrabold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 border border-blue-200 transition"
                >
                  Start Free Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
