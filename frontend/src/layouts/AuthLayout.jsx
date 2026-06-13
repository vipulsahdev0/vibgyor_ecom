import { Outlet, Navigate, Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Package, Star, TrendingUp } from "lucide-react";

function getStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

const FEATURES = [
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Role-based secure access" },
  { icon: <Package className="w-4 h-4" />,     text: "Manage orders & products" },
  { icon: <Star className="w-4 h-4" />,         text: "Wishlist & cart synced" },
  { icon: <TrendingUp className="w-4 h-4" />,   text: "Real-time admin dashboard" },
];

export default function AuthLayout() {
  const { token, user } = getStoredAuth();

  if (token && user?.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (token)                           return <Navigate to="/" replace />;

  return (
    // h-screen + overflow-hidden = nothing ever scrolls
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center
                    bg-gradient-to-br from-slate-100 via-indigo-50/40 to-violet-50/30 px-4">

      <div className="w-full max-w-5xl h-[calc(100vh-3rem)] max-h-[680px] overflow-hidden
                      rounded-3xl bg-white shadow-2xl shadow-slate-200/70 grid md:grid-cols-2">

        {/* ── Left: Brand Panel ──────────────────────────────────────── */}
        <div className="relative hidden md:flex flex-col justify-between overflow-hidden
                        bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-10 text-white">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-violet-500/15 blur-3xl" />

          {/* Top content */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10
                            bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wider
                            text-slate-300 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Vibgyor Commerce
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Shop smarter,{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                manage better.
              </span>
            </h1>

            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xs">
              Secure authentication with role-based access for customers and admin workflows.
            </p>

            <ul className="mt-7 space-y-3">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg
                                   bg-white/5 border border-white/10 text-indigo-400 shrink-0">
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-300 transition-colors">← Back to store</Link>
            <span>© {new Date().getFullYear()} Vibgyor</span>
          </div>
        </div>

        {/* ── Right: Outlet Panel ────────────────────────────────────── */}
        {/* overflow-y-auto so the form can scroll on very small heights,
            but on normal viewports nothing will scroll                  */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile brand bar */}
          <div className="md:hidden flex items-center gap-2 px-6 pt-6 pb-2 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-600 tracking-wide">
              Vibgyor Commerce
            </span>
          </div>

          {/* Form content — Login / Register renders here without its own
              outer wrapper; AuthLayout owns full-page centering            */}
          <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}