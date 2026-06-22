import api from "./axios";

const AUTH_BASE = "/api/auth";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Register
========================= */
export const registerUser = async (payload) => {
  const response = await api.post(
    `${AUTH_BASE}/register`,
    payload
  );

  return unwrap(response);
};

/* =========================
   Login
========================= */
export const loginUser = async (payload) => {
  const response = await api.post(
    `${AUTH_BASE}/login`,
    payload
  );

  return unwrap(response);
};

/* =========================
   Logout (frontend only)
========================= */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/* =========================
   Auth Helpers
========================= */
export const getStoredToken = () =>
  localStorage.getItem("token");

export const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
};

export const isAuthenticated = () =>
  !!getStoredToken();