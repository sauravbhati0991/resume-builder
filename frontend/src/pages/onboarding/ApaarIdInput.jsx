import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Info,
  ExternalLink,
  Fingerprint,
  Clock,
} from "lucide-react";
import api from "../../utils/api";

export default function ApaarIdInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [apaarId, setApaarId] = useState("");
  const [identityData, setIdentityData] = useState(null);
  const [pendingReview, setPendingReview] = useState(false);

  // Fetch current user data to confirm identity was verified
  useEffect(() => {
    const token = localStorage.getItem("token");

    // If no token (e.g. redirected to wrong port after DigiLocker), show login prompt
    if (!token) {
      setError("Session expired after DigiLocker redirect. Please log in and try again.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const userData = res.data?.data || res.data;
        const onboarding = userData?.onboarding || {};

        if (onboarding.verificationStatus === "VERIFIED") {
          navigate("/stu/pricing", { replace: true });
          return;
        }

        if (onboarding.verificationStatus === "PENDING_REVIEW") {
          setPendingReview(true);
          setIdentityData({
            name: onboarding.verifiedName || "Verified User",
            dob: onboarding.verifiedDob || "",
            gender: onboarding.verifiedGender || "",
          });
          setApaarId(onboarding.apaarId || "");
          return;
        }

        if (onboarding.verificationStatus === "IDENTITY_VERIFIED") {
          setIdentityData({
            name: onboarding.verifiedName || "Verified User",
            dob: onboarding.verifiedDob || "",
            gender: onboarding.verifiedGender || "",
          });
        } else {
          setError("Please complete DigiLocker identity verification first.");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in and try again.");
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const formatDob = (dob) => {
    if (!dob) return "N/A";
    if (dob.length === 8 && !dob.includes("-") && !dob.includes("/")) {
      return `${dob.slice(0, 2)}/${dob.slice(2, 4)}/${dob.slice(4)}`;
    }
    return dob;
  };

  const genderLabel = (g) => {
    if (g === "M") return "Male";
    if (g === "F") return "Female";
    if (g === "T") return "Other";
    return g || "N/A";
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setApaarId(val);
    setError("");
  };

  const handleSubmit = async () => {
    if (apaarId.length !== 12) {
      setError("APAAR ID must be exactly 12 digits.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await api.post("/verification/apaar/verify-id", {
        apaarId,
      });

      if (res.data?.success) {
        setPendingReview(true);
      } else {
        setError(res.data?.message || "Submission failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit APAAR ID. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F7FFF9] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#F7FFF9] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-[90px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-green-300/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[500px]">
        <div className="bg-white rounded-[32px] shadow-2xl border border-green-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500" />

          <div className="px-8 py-10">
            {pendingReview ? (
              /* ============ PENDING REVIEW STATE ============ */
              <div className="text-center space-y-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900">
                  APAAR ID Under Review
                </h1>
                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5">
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">
                    Your APAAR ID has been submitted successfully. Our team will verify it
                    and activate your student discount within <span className="font-black">24 hours</span>.
                  </p>
                </div>
                {identityData && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Name</span>
                      <span className="text-sm font-bold text-gray-900">{identityData.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">APAAR ID</span>
                      <span className="text-sm font-black text-gray-900 tracking-wider">{apaarId || "..."}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                        Pending Review
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 leading-relaxed">
                  You can continue using the standard dashboard while we review your student status.
                  You'll receive an update once verification is complete.
                </p>
                <button
                  onClick={() => navigate("/stu/pricing", { replace: true })}
                  className="w-full rounded-2xl bg-gray-900 py-4 text-white font-black hover:bg-black transition shadow-xl"
                >
                  Continue to Dashboard
                </button>
              </div>
            ) : (
              /* ============ APAAR ID INPUT FORM ============ */
              <>
                {/* Identity Verified Banner */}
                {identityData && (
                  <div className="mb-6 rounded-2xl bg-green-50 border-2 border-green-100 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          DigiLocker Verified
                        </p>
                        <p className="text-base font-black text-gray-900 leading-tight">
                          {identityData.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-[11px] text-gray-500 font-medium">
                      <span>DOB: {formatDob(identityData.dob)}</span>
                      <span>Gender: {genderLabel(identityData.gender)}</span>
                    </div>
                  </div>
                )}

                {/* APAAR ID Input Section */}
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                    <Fingerprint className="h-7 w-7 text-amber-600" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">
                    Enter Your APAAR ID
                  </h1>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    Your identity is verified. Now enter your{" "}
                    <span className="font-bold text-amber-600">12-digit APAAR ID</span>{" "}
                    to confirm your student status and unlock the 50% discount.
                  </p>
                </div>

                {/* APAAR Input */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 12-digit APAAR ID"
                      value={apaarId}
                      onChange={handleChange}
                      maxLength={12}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 text-center text-lg font-black tracking-[0.25em] text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-medium focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                    <div className="mt-2 flex justify-between px-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {apaarId.length}/12 digits
                      </span>
                      {apaarId.length === 12 && (
                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid format
                        </span>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={apaarId.length !== 12 || submitting}
                    className={`w-full rounded-2xl py-4 text-white font-black shadow-xl transition flex items-center justify-center gap-2 ${
                      apaarId.length === 12 && !submitting
                        ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Submit APAAR ID for Review
                      </>
                    )}
                  </button>
                </div>

                {/* Info Section */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 text-[11px] text-gray-400 leading-relaxed bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-700 mb-1">
                        What is APAAR ID?
                      </p>
                      <p className="text-blue-600">
                        APAAR (Automated Permanent Academic Account Registry) is a
                        unique 12-digit ID assigned to every student in India. It's
                        linked to your Academic Bank of Credits (ABC).
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://www.abc.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition py-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Don't know your APAAR ID? Find it on abc.gov.in
                  </a>
                </div>

                {/* Back */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
                  {!localStorage.getItem("token") ? (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full rounded-2xl bg-gray-900 py-4 text-white font-black hover:bg-black transition shadow-xl"
                    >
                      Log In to Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/onboarding/verify-student")}
                      className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-800 transition"
                    >
                      ← Back to Verification
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
