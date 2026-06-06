import { Outlet, Navigate } from "react-router-dom";

function getStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export default function AuthLayout() {
  const { token, user } = getStoredAuth();

  if (token && user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid min-h-[80vh] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden bg-slate-900 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-300">
              Vibgyor Commerce
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Manage shopping, orders, and admin workflows in one place.
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-300">
              Secure authentication with role-based access for users and admin modules.
            </p>
          </div>

          <div className="text-sm text-slate-400">
            Sign in or create an account to continue.
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 md:p-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}