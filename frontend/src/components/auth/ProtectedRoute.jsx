import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const { user, loading } = useAuth();

  const role = user?.role;
  const normalizedRole =
    typeof role === "string"
      ? role.replace(/^ROLE_/, "").toUpperCase()
      : "";

  const isAdmin = normalizedRole === "ADMIN";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Loading...
        </h1>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}