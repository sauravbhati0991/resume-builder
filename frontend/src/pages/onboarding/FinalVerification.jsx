import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import api from "../../utils/api";

export default function FinalVerification() {
  const navigate = useNavigate();

  const TEST_OTP = "123456";

  const onboarding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const email = onboarding?.email || user?.email || "test1.user@example.com";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const otpString = otp.join("");
  const canSubmit = otpString.length === 6;

  const focusIndex = (i) => {
    const el = inputsRef.current?.[i];
    if (el) el.focus();
  };

  const onChangeDigit = (i, v) => {
    setError("");
    const digit = (v || "").replace(/\D/g, "").slice(-1);

    const next = [...otp];
    next[i] = digit;
    setOtp(next);

    if (digit && i < 5) focusIndex(i + 1);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (otp[i]) {
        const next = [...otp];
        next[i] = "";
        setOtp(next);
        return;
      }
      if (i > 0) focusIndex(i - 1);
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    setError("");

    const text = e.clipboardData.getData("text") || "";
    const digits = text.replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;

    const next = Array(6).fill("");
    digits.forEach((d, idx) => (next[idx] = d));
    setOtp(next);

    const lastFilled = Math.min(digits.length, 6) - 1;
    if (lastFilled >= 0) focusIndex(lastFilled);
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const safeGet = (key, fallback = {}) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  };

  const patchOnboardingDB = async (payload) => {
    const res = await api.patch("/users/me/onboarding", payload);
    const me = res?.data;

    safeSet("user", me || {});
    safeSet("onboarding", me?.onboarding || {});
    return me;
  };

  const finalizeStudent = async (verificationPatch) => {
    await patchOnboardingDB({
      accountType: "student",
      isStudent: true,
      completed: true,
      ...verificationPatch,
    });

    const ob = safeGet("onboarding", {});
    const u = safeGet("user", {});
    safeSet("onboarding", {
      ...ob,
      accountType: "student",
      isStudent: true,
      completed: true,
      onboardingCompleted: true,
      completedAt: new Date().toISOString(),
      ...verificationPatch,
    });
    safeSet("user", {
      ...u,
      accountType: "student",
      onboardingCompleted: true,
    });

    navigate("/stu", { replace: true });
  };

  const onSubmit = async () => {
    setError("");
    if (!canSubmit || loading) return;

    if (otpString !== TEST_OTP) {
      setError("Invalid code. Try TEST ACCESS: 123456");
      return;
    }

    try {
      setLoading(true);
      await finalizeStudent({
        otpVerified: true,
        verificationStatus: "VERIFIED",
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = () => {
    setError("");
    alert("Resend channel triggered (UI only).");
  };

  const onSkip = async () => {
    setError("");
    if (loading) return;

    try {
      setLoading(true);
      await finalizeStudent({
        otpVerified: false,
        verificationStatus: "SKIPPED",
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FBFF] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-10">

      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-24 right-[-140px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-purple-300/20 blur-[90px]" />
        <div className="absolute bottom-[-200px] left-[-160px] h-[420px] sm:h-[520px] w-[420px] sm:w-[520px] rounded-full bg-sky-200/25 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[420px] sm:max-w-[460px] -translate-y-6 sm:-translate-y-10">
        <div className="bg-white rounded-[22px] sm:rounded-[26px] shadow-2xl border-2 border-blue-300/70 ring-1 ring-blue-100/40 overflow-hidden">

          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 sm:px-8 md:px-10 py-8 sm:py-10">

            <div className="mx-auto mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>

            <div className="text-center">
              <h1 className="text-[18px] sm:text-[20px] font-extrabold text-gray-900">
                Final Verification
              </h1>

              <p className="mt-2 text-[11px] sm:text-[12px] text-gray-400 leading-relaxed">
                A secure 6-digit access code was sent to{" "}
                <span className="text-blue-600 font-semibold">{email}</span>
              </p>
            </div>

            {/* OTP BOX */}
            <div className="mt-6 sm:mt-7 rounded-2xl border-2 border-[#0B1733] bg-white px-4 sm:px-5 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3 sm:gap-4" onPaste={onPaste}>
                {otp.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={val}
                    onChange={(e) => onChangeDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-6 sm:w-7 bg-transparent text-center text-[15px] sm:text-[16px] font-semibold text-gray-800 outline-none"
                  />
                ))}
              </div>
            </div>

            {/* TEST ACCESS */}
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-bold text-yellow-700">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                TEST ACCESS: {TEST_OTP}
              </span>
            </div>

            {error && (
              <div className="mt-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || loading}
              className={[
                "mt-6 w-full rounded-xl font-extrabold text-white py-2.5 sm:py-3 text-sm sm:text-base shadow-lg transition",
                canSubmit && !loading
                  ? "bg-[#0B1733] hover:bg-[#071028]"
                  : "bg-[#0B1733]/40 cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Verifying..." : "Establish My Identity"}
            </button>

            <div className="mt-4 text-center text-[11px] sm:text-[12px] text-gray-400">
              Didn&apos;t catch the signal?{" "}
              <button
                type="button"
                onClick={onResend}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Resend Channel
              </button>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={onSkip}
                disabled={loading}
                className={[
                  "text-[11px] sm:text-[12px] hover:text-gray-800",
                  loading ? "text-gray-300 cursor-not-allowed" : "text-gray-500",
                ].join(" ")}
              >
                Skip for now (Standard Free Tier)
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 w-full text-xs sm:text-sm text-gray-500 hover:text-gray-800"
            >
              Back
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}