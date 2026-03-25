import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const v = String(t).toLowerCase();
  if (v === "student") return "student";
  if (v === "professional") return "professional";
  if (v === "pro") return "professional";
  return null;
}

function readAccountType() {
  const user = safeParse("user", {});
  const onboarding = safeParse("onboarding", {});

  // prefer stable values
  const t1 = normalizeType(user?.accountType) || normalizeType(user?.userType);
  if (t1) return t1;

  const t2 = normalizeType(onboarding?.accountType) || normalizeType(onboarding?.userType);
  if (t2) return t2;

  const isStudent = onboarding?.isStudent;
  if (isStudent === "no") return "professional";
  if (isStudent === "yes" || isStudent === "skipped") return "student";

  return null;
}

export default function DashboardGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const type = readAccountType();

    // if still unknown, send user to StudentStatus to choose (or you can show a UI here)
    if (!type) {
      navigate("/onboarding/student", { replace: true });
      return;
    }

    navigate(type === "professional" ? "/pro" : "/stu", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}