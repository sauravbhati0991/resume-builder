import { Mail, Lock, KeyRound, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Helmet } from "react-helmet-async";

// 🔹 Reusable Input
const InputField = ({ icon: Icon, type, value, onChange, placeholder }) => (
  <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F3F7FF] border border-[#C7D9FF] px-4 py-3">
    <Icon className="h-4 w-4 text-gray-500" />
    <input
      type={type}
      className="w-full bg-transparent outline-none text-sm"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
    />
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=password

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 🔹 Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setStep(2);
      setMessage("OTP sent to your email");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      setStep(3);
      setMessage("OTP verified successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        newPassword,
      });

      setMessage("Password reset successful 🎉");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — Resume Builder</title>
      </Helmet>

      <section className="min-h-screen bg-[#F7FBFF] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="p-6">
              <h1 className="text-2xl font-bold text-center">
                Forgot Password
              </h1>

              <p className="text-center text-sm text-gray-500 mt-2">
                {step === 1
                  ? "Enter your email"
                  : step === 2
                    ? "Enter OTP"
                    : "Set new password"}
              </p>

              {/* STEP 1 */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                  <label className="text-xs font-bold">EMAIL</label>
                  <InputField
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />

                  <button
                    disabled={loading || !email}
                    className="w-full bg-blue-700 text-white py-3 rounded-xl"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                  <label className="text-xs font-bold">OTP</label>
                  <InputField
                    icon={KeyRound}
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />

                  <button
                    disabled={loading || !otp}
                    className="w-full bg-blue-700 text-white py-3 rounded-xl"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                  <label className="text-xs font-bold">NEW PASSWORD</label>
                  <InputField
                    icon={Lock}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />

                  <label className="text-xs font-bold">CONFIRM PASSWORD</label>
                  <InputField
                    icon={Lock}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />

                  <button
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full bg-blue-700 text-white py-3 rounded-xl"
                  >
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </form>
              )}

              {/* MESSAGES */}
              {message && (
                <p className="text-green-600 text-sm mt-4 text-center">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
