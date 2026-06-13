import { createContext, useEffect, useMemo, useReducer } from "react";
import { TOKEN_KEY, USER_KEY } from "../api/axios";

export const AuthContext = createContext(null);

// ── helpers ───────────────────────────────────────────────────────────────────
function readStorage() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)?.trim() ?? "";
    const raw   = localStorage.getItem(USER_KEY);
    const user  = raw ? JSON.parse(raw) : null;
    return token && user?.userId ? { token, user } : null;
  } catch {
    return null;
  }
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function writeStorage(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function normalizeUser(data) {
  return {
    userId:    data?.userId    ?? null,
    firstName: data?.firstName ?? "",
    lastName:  data?.lastName  ?? "",
    email:     data?.email     ?? "",
    // Accept both "ADMIN" and "ROLE_ADMIN" from Spring Boot
    role:      (data?.role ?? "").replace("ROLE_", ""),
  };
}

// ── reducer ───────────────────────────────────────────────────────────────────
const INITIAL = { user: null, token: "", loading: true };

function reducer(state, action) {
  switch (action.type) {
    case "RESTORE":
      return action.payload
        ? { user: action.payload.user, token: action.payload.token, loading: false }
        : { ...INITIAL, loading: false };
    case "LOGIN":
      return { user: action.payload.user, token: action.payload.token, loading: false };
    case "LOGOUT":
      return { ...INITIAL, loading: false };
    default:
      return state;
  }
}

// ── provider ──────────────────────────────────────────────────────────────────
export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Restore session on mount
  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      dispatch({ type: "RESTORE", payload: stored });
    } else {
      clearStorage();
      dispatch({ type: "RESTORE", payload: null });
    }
  }, []);

  const login = (data) => {
    const token = data?.token?.trim?.() ?? "";
    const user  = normalizeUser(data);

    if (!token || !user.userId) {
      clearStorage();
      dispatch({ type: "LOGOUT" });
      return false;
    }

    writeStorage(token, user);
    dispatch({ type: "LOGIN", payload: { token, user } });
    return true;
  };

  const logout = () => {
    clearStorage();
    dispatch({ type: "LOGOUT" });
  };

  const value = useMemo(() => ({
    user:            state.user,
    token:           state.token,
    loading:         state.loading,
    isAuthenticated: Boolean(state.token && state.user?.userId),
    isAdmin:         state.user?.role === "ADMIN",
    login,
    logout,
  // login/logout are stable function refs — no memo deps needed for them
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}