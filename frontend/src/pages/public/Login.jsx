import { useState } from "react";
import { loginUser } from "../../api/authApi";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck } from "lucide-react";

// ─── Reusable labelled field ──────────────────────────────────────────────────
function Field({ label, id, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
        {children}
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Login — no outer viewport wrapper (AuthLayout owns the page) ─────────────
export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim())                       errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email    = "Enter a valid email";
    if (!formData.password.trim())                    errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const data = await loginUser({ email: formData.email.trim(), password: formData.password });
      login(data);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname;
      navigate(
        data.role === "ADMIN"
          ? (redirectTo || "/admin/dashboard")
          : (redirectTo || "/account/profile"),
        { replace: true }
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top gradient accent line */}
      <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 -mt-px" />

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to your Vibgyor account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email address" id="email" icon={Mail} error={errors.email}>
          <input
            id="email" type="email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com" autoComplete="email"
            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800
              placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition
              ${errors.email
                ? "border-rose-300 focus:ring-rose-400"
                : "border-slate-200 focus:ring-indigo-500 focus:border-transparent"}`}
          />
        </Field>

        <Field label="Password" id="password" icon={Lock} error={errors.password}>
          <input
            id="password" type={showPass ? "text" : "password"} name="password"
            value={formData.password} onChange={handleChange}
            placeholder="••••••••" autoComplete="current-password"
            className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800
              placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition
              ${errors.password
                ? "border-rose-300 focus:ring-rose-400"
                : "border-slate-200 focus:ring-indigo-500 focus:border-transparent"}`}
          />
          <button
            type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPass ? "Hide password" : "Show password"}>
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        <div className="flex justify-end">
          <Link to="/forgot-password"
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5
            text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700
            active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Signing in…
            </>
          ) : (
            <><LogIn className="w-4 h-4" /> Sign In</>
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Create one free
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Vibgyor</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure login</span>
      </div>
    </>
  );
}