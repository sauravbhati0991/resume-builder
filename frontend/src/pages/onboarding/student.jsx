import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    fullName.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 8 &&
    password === confirmPassword;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const res = await api.post("/auth/signup", {
        fullName,
        email,
        password,
      });

      const token = res?.data?.token;
      const user = res?.data?.user || { fullName, email };

      if (token) localStorage.setItem("userToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Seed onboarding data
      const onboardingSeed = {
        fullName,
        email,
        onboardingCompleted: false,
        startedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "onboarding",
        JSON.stringify(onboardingSeed)
      );

      // optional per-email flag
      localStorage.setItem(
        `onboardingDone:${email.toLowerCase()}`,
        "false"
      );

      // ✅ GO TO STUDENT STAGE (your requirement)
      navigate("/onboarding/student");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Signup failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-4">

      {/* glow bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-24 right-[-140px] h-[520px] w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-xl -translate-y-10">

        <div className="bg-white rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">

          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-8 sm:px-10 py-9">
            <div className="text-center">
              <h1 className="text-xl font-extrabold text-gray-900">
                Create Account
              </h1>
              <p className="mt-1 text-[11px] tracking-wider text-gray-400 font-semibold">
                ESTABLISH YOUR DIGITAL PRESENCE
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={onSubmit}>

              <Field
                label="FULL NAME"
                icon={<User className="h-4 w-4 text-gray-400" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="enter your name"
              />

              <Field
                label="EMAIL ADDRESS"
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your mail"
                type="email"
              />

              {/* PASSWORD */}
              <PasswordField
                label="PASSWORD"
                value={password}
                onChange={setPassword}
                show={showPw}
                setShow={setShowPw}
              />

              {/* CONFIRM */}
              <PasswordField
                label="CONFIRM PASSWORD"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPw}
                setShow={setShowConfirmPw}
              />

              {confirmPassword &&
                password !== confirmPassword && (
                  <p className="text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                  {error}
                </div>
              )}

              <button
                disabled={!canSubmit || submitting}
                className="mt-2 w-full rounded-xl font-bold text-white py-3 shadow-lg transition bg-[#0B1733] hover:bg-[#071028]"
              >
                {submitting ? "Creating..." : "Begin Onboarding"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full text-sm text-gray-500 hover:text-gray-800"
              >
                Already have an account?{" "}
                <span className="font-semibold text-blue-600">
                  Sign in
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Reusable Fields ---------- */

const Field = ({ label, icon, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold tracking-wider text-gray-500 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2">
        {icon}
      </span>
      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
      />
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange, show, setShow }) => (
  <div>
    <label className="block text-xs font-bold tracking-wider text-gray-500 mb-2">
      {label}
    </label>

    <div className="relative flex items-center">
      <span className="absolute left-4">
        <Lock className="h-4 w-4 text-gray-400" />
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={show ? "text" : "password"}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-4 text-gray-500"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default Signup;