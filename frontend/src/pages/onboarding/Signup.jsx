import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Eye, EyeOff, KeyRound, RotateCcw, ArrowRight } from "lucide-react";
import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();

  // step
  const [step, setStep] = useState("SIGNUP"); // SIGNUP | OTP

  // signup form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // otp
  const [otp, setOtp] = useState("");

  // ui
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const fullNameOk = fullName.trim().length >= 2;
  const pwOk = password.length >= 8;
  const pwMatch = password === confirmPassword;

  const canSubmitSignup = fullNameOk && emailOk && pwOk && pwMatch;

  const canSubmitOtp = useMemo(() => {
    const v = String(otp || "").trim();
    return emailOk && v.length >= 4; // allow 4-6
  }, [otp, emailOk]);

  const setMsg = (type, text) => {
    if (type === "error") {
      setError(text || "");
      setInfo("");
    } else {
      setInfo(text || "");
      setError("");
    }
  };

  // ✅ decides next route after verification
  const afterVerified = () => {
    // ✅ keep your flow
    // user will choose student/professional in StudentStatus screen
    navigate("/onboarding/student");
  };

  // 1) SIGNUP -> sends OTP (no token)
  const onSubmitSignup = async (e) => {
    e.preventDefault();
    setMsg("error", "");
    setMsg("info", "");

    if (!canSubmitSignup) {
      if (!fullNameOk) return setMsg("error", "Full name must be at least 2 characters.");
      if (!emailOk) return setMsg("error", "Please enter a valid email address.");
      if (!pwOk) return setMsg("error", "Password must be minimum 8 characters.");
      if (!pwMatch) return setMsg("error", "Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/auth/signup", {
        fullName,
        email,
        password,
      });

      // ✅ new flow: requiresOtp true
      if (res?.data?.requiresOtp) {
        setStep("OTP");
        setMsg("info", res?.data?.message || "OTP sent to your email.");
        return;
      }

      // fallback: if backend still returns token (old behavior)
      const token = res?.data?.token;
      const user = res?.data?.user || { fullName, email };
      if (token) {
        localStorage.setItem("userToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("onboarding", JSON.stringify({ fullName, email, onboardingCompleted: false }));
        localStorage.setItem(`onboardingDone:${email.toLowerCase()}`, "false");
        afterVerified();
        return;
      }

      setMsg("error", "Unexpected response from server.");
    } catch (err) {
      setMsg("error", err?.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2) VERIFY OTP -> token -> continue
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setMsg("error", "");
    setMsg("info", "");
    if (!canSubmitOtp) return;

    try {
      setSubmitting(true);

      const res = await api.post("/auth/signup/verify-otp", {
        email: email.trim(),
        otp: String(otp || "").trim(),
      });

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (!token) {
        setMsg("error", "OTP verification failed (missing token).");
        return;
      }

      localStorage.setItem("userToken", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // ✅ Seed onboarding data (keep your structure)
      const onboardingSeed = {
        fullName: user?.fullName || fullName,
        email: user?.email || email,
        onboardingCompleted: false,
        startedAt: new Date().toISOString(),
      };

      localStorage.setItem("onboarding", JSON.stringify(onboardingSeed));
      localStorage.setItem(`onboardingDone:${String(email).toLowerCase()}`, "false");

      afterVerified();
    } catch (err) {
      setMsg("error", err?.response?.data?.message || "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  // 3) RESEND OTP
  const onResendOtp = async () => {
    if (!emailOk) return setMsg("error", "Enter a valid email first.");

    try {
      setResendLoading(true);
      setMsg("error", "");
      setMsg("info", "");

      const res = await api.post("/auth/signup/resend-otp", {
        email: email.trim(),
      });

      setMsg("info", res?.data?.message || "OTP resent to your email.");
    } catch (err) {
      setMsg("error", err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const backToSignup = () => {
    setStep("SIGNUP");
    setOtp("");
    setMsg("error", "");
    setMsg("info", "");
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
                {step === "SIGNUP" ? "Create Account" : "Verify Email OTP"}
              </h1>
              <p className="mt-1 text-[11px] tracking-wider text-gray-400 font-semibold">
                {step === "SIGNUP"
                  ? "ESTABLISH YOUR DIGITAL PRESENCE"
                  : "ENTER THE OTP SENT TO YOUR EMAIL"}
              </p>
            </div>

            {/* INFO / ERROR */}
            {info && (
              <div className="mt-5 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl p-3">
                {info}
              </div>
            )}
            {error && (
              <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                {error}
              </div>
            )}

            {/* SIGNUP STEP */}
            {step === "SIGNUP" ? (
              <form className="mt-7 space-y-5" onSubmit={onSubmitSignup}>
                <Field
                  label="FULL NAME"
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="enter your name"
                />
                {fullName && !fullNameOk && (
                  <p className="text-xs text-red-600 -mt-3">
                    Full name must be at least 2 characters
                  </p>
                )}

                <Field
                  label="EMAIL ADDRESS"
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your mail"
                  type="email"
                />
                {email && !emailOk && (
                  <p className="text-xs text-red-600 -mt-3">
                    Please enter a valid email address
                  </p>
                )}

                <PasswordField
                  label="PASSWORD"
                  value={password}
                  onChange={setPassword}
                  show={showPw}
                  setShow={setShowPw}
                />
                {password && !pwOk && (
                  <p className="text-xs text-red-600 -mt-3">
                    Password must be minimum 8 characters
                  </p>
                )}
                {!password && (
                  <p className="text-xs text-gray-400 -mt-3">
                    Minimum 8 characters required
                  </p>
                )}

                <PasswordField
                  label="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPw}
                  setShow={setShowConfirmPw}
                />
                {confirmPassword && !pwMatch && (
                  <p className="text-xs text-red-600 -mt-3">
                    Passwords do not match
                  </p>
                )}

                <button
                  disabled={!canSubmitSignup || submitting}
                  className="mt-2 w-full rounded-xl font-bold text-white py-3 shadow-lg transition bg-[#0B1733] hover:bg-[#071028] disabled:opacity-60"
                >
                  {submitting ? "Sending OTP..." : "Create & Send OTP"}
                </button>
              </form>
            ) : (
              /* OTP STEP */
              <form className="mt-7 space-y-5" onSubmit={onVerifyOtp}>
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-500 mb-2">
                    EMAIL
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-[#F3F7FF] border border-[#C7D9FF] px-4 py-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      className="w-full bg-transparent outline-none text-sm text-gray-900"
                      value={email}
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    onClick={backToSignup}
                    className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    Change details
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-500 mb-2">
                    OTP
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-[#F3F7FF] border border-[#C7D9FF] px-4 py-3 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
                    <KeyRound className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 tracking-widest"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onResendOtp}
                      disabled={resendLoading}
                      className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {resendLoading ? "Resending..." : "Resend OTP"}
                    </button>

                    <span className="text-[11px] text-gray-400">
                      Check Spam / Promotions
                    </span>
                  </div>
                </div>

                <button
                  disabled={!canSubmitOtp || submitting}
                  className="w-full rounded-xl font-bold text-white py-3 shadow-lg transition bg-[#0B1733] hover:bg-[#071028] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? "Verifying..." : (
                    <>
                      Verify & Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full text-sm text-gray-500 hover:text-gray-800"
            >
              Already have an account?{" "}
              <span className="font-semibold text-blue-600">Sign in</span>
            </button>
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
      <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
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