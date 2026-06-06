import { Outlet, NavLink, useNavigate } from "react-router-dom";

function getStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { token, user } = getStoredAuth();

  const isAdmin = token && user?.role === "ADMIN";

  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }

  if (!isAdmin) {
    navigate("/", { replace: true });
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    [
      "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-200 hover:text-slate-900",
    ].join(" ");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Admin Panel</h2>
          <p className="mt-1 text-sm text-slate-500">
            {user?.firstName ? `Welcome, ${user.firstName}` : "Management console"}
          </p>
        </div>

        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navClass}>
            Products
          </NavLink>
          <NavLink to="/admin/categories" className={navClass}>
            Categories
          </NavLink>
          <NavLink to="/admin/orders" className={navClass}>
            Orders
          </NavLink>
          <NavLink to="/admin/users" className={navClass}>
            Users
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-8 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}