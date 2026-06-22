import axios from "axios";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/* =========================
   Local Storage Helpers
========================= */

export const getStoredAuth = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY)?.trim() || null;
    const user = JSON.parse(
      localStorage.getItem(USER_KEY) || "null"
    );

    return { token, user };
  } catch {
    return {
      token: null,
      user: null,
    };
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const saveAuth = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
};

/* =========================
   Request Interceptor
========================= */

api.interceptors.request.use(
  (config) => {
    const { token } = getStoredAuth();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
========================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register");

    if (status === 401 && !isAuthRoute) {
      clearStoredAuth();

      if (
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    return Promise.reject({
      ...error,
      message: backendMessage,
    });
  }
);

export default api;