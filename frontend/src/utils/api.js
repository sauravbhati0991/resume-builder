import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
});

/**
 * Decide which token to use based on URL
 */
function resolveToken(url = "") {
  const adminToken = localStorage.getItem("adminToken");
  const userToken =
    localStorage.getItem("userToken") || localStorage.getItem("token");

  // Admin APIs
  if (url.startsWith("/admin")) {
    return adminToken;
  }

  // Default → user
  return userToken;
}

api.interceptors.request.use(
  (config) => {
    const token = resolveToken(config.url || "");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;