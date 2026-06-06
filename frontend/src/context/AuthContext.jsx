import { createContext, useEffect, useMemo, useState } from "react";
import { TOKEN_KEY, USER_KEY } from "../api/axios";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && storedToken && storedToken.trim()) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken.trim());
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken("");
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    const authToken = data?.token?.trim?.() || "";

    const normalizedUser = {
      userId: data?.userId ?? null,
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      email: data?.email ?? "",
      role: data?.role ?? "",
    };

    if (!authToken || !normalizedUser.userId) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken("");
      setUser(null);
      return false;
    }

    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    setToken(authToken);
    setUser(normalizedUser);

    return true;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  };

  const isAuthenticated = Boolean(token?.trim() && user?.userId);
  const isAdmin = user?.role === "ADMIN";

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isAdmin,
    }),
    [user, token, loading, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}