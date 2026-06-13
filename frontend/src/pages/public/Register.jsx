import { useState } from "react";
import { registerUser } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  UserPlus, Sparkles, ShieldCheck,
} from "lucide-react";

// ─── Labelled field wrapper ───────────────────────────────────────────────────
function Field({ label, id, icon: Icon, error, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-3.5 h-3.5" />
        </span>
        {children}
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

const INPUT_BASE =
  "w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-slate-50 text-slate-800 " +
  "placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition";
const INPUT_OK  = "border-slate-200 focus:ring-indigo-500 focus:border-transparent";
const INPUT_ERR = "border-rose-300 focus:ring-rose-400";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", mobile: "", password: "",
  });
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
    if (!formData.firstName.trim())                        errs.firstName = "First name is required";
    if (!formData.email.trim())                            errs.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))     errs.email     = "Enter a valid email";
    if (!formData.mobile.trim())                           errs.mobile    = "Mobile is required";
    else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) errs.mobile    = "Enter a valid 10-digit number";
    if (!formData.password.trim())                         errs.password  = "Password is required";
    else if (formData.password.length < 6)                 errs.password  = "Min. 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      await registerUser({
        firstName: formData.firstName.trim(),
        lastName:  formData.lastName.trim(),
        email:     formData.email.trim(),
        mobile:    formData.mobile.trim(),
        password:  formData.password,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // No outer wrapper — AuthLayout owns the viewport
  return (
    <>
      {/* Accent bar */}
      <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600 -mt-px" />

      {/* Header */}
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
          <UserPlus className="w-6 h-6 text-violet-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h1>
        <p className="mt-1 text-xs text-slate-400">Join Vibgyor — it&apos;s free</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *" id="firstName" icon={User} error={errors.firstName}>
            <input
              id="firstName" type="text" name="firstName"
              value={formData.firstName} onChange={handleChange}
              placeholder="Vipul" autoComplete="given-name"
              className={`${INPUT_BASE} ${errors.firstName ? INPUT_ERR : INPUT_OK}`}
            />
          </Field>
          <Field label="Last name" id="lastName" icon={User} error={errors.lastName}>
            <input
              id="lastName" type="text" name="lastName"
              value={formData.lastName} onChange={handleChange}
              placeholder="Sahdev" autoComplete="family-name"
              className={`${INPUT_BASE} ${errors.lastName ? INPUT_ERR : INPUT_OK}`}
            />
          </Field>
        </div>

        <Field label="Email address *" id="email" icon={Mail} error={errors.email}>
          <input
            id="email" type="email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com" autoComplete="email"
            className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
          />
        </Field>

        <Field label="Mobile number *" id="mobile" icon={Phone} error={errors.mobile}>
          <input
            id="mobile" type="tel" name="mobile"
            value={formData.mobile} onChange={handleChange}
            placeholder="10-digit number" autoComplete="tel"
            maxLength={10}
            className={`${INPUT_BASE} ${errors.mobile ? INPUT_ERR : INPUT_OK}`}
          />
        </Field>

        <Field label="Password *" id="password" icon={Lock} error={errors.password}>
          <input
            id="password" type={showPass ? "text" : "password"} name="password"
            value={formData.password} onChange={handleChange}
            placeholder="Min. 6 characters" autoComplete="new-password"
            className={`${INPUT_BASE} pr-10 ${errors.password ? INPUT_ERR : INPUT_OK}`}
          />
          {/* Password strength bar */}
          {formData.password && (
            <div className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300"
              style={{
                width: formData.password.length >= 10 ? "100%" : formData.password.length >= 6 ? "60%" : "30%",
                background: formData.password.length >= 10 ? "#22c55e" : formData.password.length >= 6 ? "#f59e0b" : "#f43f5e",
              }}
            />
          )}
          <button
            type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPass ? "Hide password" : "Show password"}>
            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </Field>

        {/* Terms micro-copy */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link to="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>.
        </p>

        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5
            text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700
            active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Creating account…
            </>
          ) : (
            <><UserPlus className="w-4 h-4" /> Create Account</>
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Sign in
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Vibgyor</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure signup</span>
      </div>
    </>
  );
}