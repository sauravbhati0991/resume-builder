// src/lib/auth.js

const USERS_KEY = "users";
const CURRENT_USER_KEY = "user";

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(newUser) {
  const users = getUsers();
  const email = (newUser.email || "").trim().toLowerCase();

  // prevent duplicates
  const exists = users.some((u) => (u.email || "").toLowerCase() === email);
  if (exists) {
    return { ok: false, message: "Account already exists with this email." };
  }

  const user = {
    id: Date.now(),
    fullName: newUser.fullName || "User",
    email: newUser.email,
    password: newUser.password, // UI-only (later backend)
    onboardingCompleted: !!newUser.onboardingCompleted,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function findUserByCreds(email, password) {
  const users = getUsers();
  const e = (email || "").trim().toLowerCase();
  const p = password || "";
  return users.find(
    (u) => (u.email || "").toLowerCase() === e && (u.password || "") === p
  );
}

export function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "{}");
  } catch {
    return {};
  }
}

export function markOnboardingComplete(email) {
  const users = getUsers();
  const e = (email || "").trim().toLowerCase();

  const next = users.map((u) =>
    (u.email || "").toLowerCase() === e ? { ...u, onboardingCompleted: true } : u
  );

  saveUsers(next);
}