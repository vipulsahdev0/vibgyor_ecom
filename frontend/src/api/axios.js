import axios from "axios";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token?.trim()) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const responseData = error.response?.data;

    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register");

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    const normalizedError = {
      ...error,
      status,
      url: requestUrl,
      message:
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Something went wrong",
      details: responseData?.details || [],
      data: responseData || null,
    };

    return Promise.reject(normalizedError);
  }
);

export default api;