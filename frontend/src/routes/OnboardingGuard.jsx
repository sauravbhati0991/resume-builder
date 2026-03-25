import React from "react";
import { Navigate } from "react-router-dom";

export default function OnboardingGuard({ children }) {
  let done = false;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const onboarding = JSON.parse(localStorage.getItem("onboarding") || "{}");
    done = !!(user?.onboardingDone || onboarding?.onboardingDone);
  } catch {}

  // If already done, never show onboarding screens again
  if (done) return <Navigate to="/dashboard" replace />;

  return children;
}