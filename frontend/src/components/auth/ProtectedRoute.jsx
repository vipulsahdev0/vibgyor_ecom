import { Navigate } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  const normalizedRole =
    typeof user?.role === "string"
      ? user.role.replace(/^ROLE_/, "").toUpperCase()
      : "";

  const isAdmin = normalizedRole === "ADMIN";

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-slate-200/60">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Verifying access…</p>
          <p className="mt-1 text-xs text-slate-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">
              Access Denied
            </h1>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      </>
    );
  }

  return children;
}