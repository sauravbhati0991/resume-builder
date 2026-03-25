import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function safeParse(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "null" || raw === "undefined") return fallback;
    const val = JSON.parse(raw);
    return val && typeof val === "object" ? val : fallback;
  } catch {
    return fallback;
  }
}

function normalizeType(t) {
  if (!t) return null;
  const v = String(t).trim().toLowerCase();
  if (v === "student") return "student";
  if (v === "professional" || v === "pro") return "professional";
  return null;
}

function readAccountType() {
  const user = safeParse("user", {});
  const onboarding = safeParse("onboarding", {});

  // ✅ BEST (DB-driven): user.onboarding.accountType
  const t0 = normalizeType(user?.onboarding?.accountType);
  if (t0) return t0;

  // ✅ 1) user.accountType
  const t1 = normalizeType(user?.accountType);
  if (t1) return t1;

  // ✅ 2) legacy userType
  const t1b = normalizeType(user?.userType);
  if (t1b) return t1b;

  // ✅ 3) onboarding.accountType
  const t2 = normalizeType(onboarding?.accountType);
  if (t2) return t2;

  // ✅ 4) legacy onboarding.userType
  const t2b = normalizeType(onboarding?.userType);
  if (t2b) return t2b;

  // ✅ 5) onboarding.isStudent can be boolean OR "yes/no/skipped"
  const isStudent = onboarding?.isStudent;

  if (isStudent === false || isStudent === "no") return "professional";
  if (isStudent === true || isStudent === "yes" || isStudent === "skipped")
    return "student";

  return null;
}

export default function UserProtectedRoute({ children, allowed }) {
  const location = useLocation();
  const token = localStorage.getItem("userToken");
  const accountType = readAccountType();

  // ✅ Not logged in
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ✅ Logged in but type unknown -> resolve at gate
  if (!accountType) {
    return <Navigate to="/dashboard-gate" replace />;
  }

  // ✅ If allowed not provided, just allow any authenticated user
  if (!allowed) return children;

  // ✅ Mismatch protection
  if (allowed === "student" && accountType !== "student") {
    return <Navigate to="/pro" replace />;
  }

  if (allowed === "professional" && accountType !== "professional") {
    return <Navigate to="/stu" replace />;
  }

  return children;
}