export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user || {}));
}

export function setUserToken(token) {
  if (token) localStorage.setItem("userToken", token);
}

export function onboardingKey(user) {
  const id = user?.id || user?._id || user?.user_id || user?.email;
  return id ? `onboarding_done_${String(id).toLowerCase()}` : "onboarding_done_unknown";
}

export function isOnboardingDone(user) {
  // prefer backend value if present
  if (user?.onboardingCompleted) return true;

  const key = onboardingKey(user);
  return localStorage.getItem(key) === "true";
}

export function markOnboardingDone(user) {
  const key = onboardingKey(user);
  localStorage.setItem(key, "true");

  // also update stored user object
  const stored = getStoredUser();
  const merged = { ...stored, ...user, onboardingCompleted: true };
  setStoredUser(merged);

  // also keep in onboarding object (optional)
  const existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
  localStorage.setItem("onboarding", JSON.stringify({ ...existing, onboardingCompleted: true }));
}