import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { registerUser } from "../../api/authApi";

const initialForm = { firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPassword: "" };

export default function Register() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(initialForm);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCp,  setShowCp]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = "First name is required";
    if (!form.lastName.trim())   e.lastName  = "Last name is required";
    if (!form.email.trim())      e.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.mobile.trim())     e.mobile    = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.password)          e.password  = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      // POST /api/auth/register → { message }
      await registerUser({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        mobile:    form.mobile.trim(),
        password:  form.password,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  const Field = ({ id, label, icon: Icon, type = "text", placeholder, suffix }) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          id={id} name={id} type={type} value={form[id]} onChange={handleChange}
          placeholder={placeholder} autoComplete={id}
          className={`w-full rounded-xl border py-2.5 pl-10 ${suffix ? "pr-10" : "pr-4"} text-sm text-slate-800 outline-none transition
            focus:ring-2 focus:border-transparent
            ${errors[id]
              ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
              : "border-slate-200 bg-slate-50 focus:ring-indigo-400 focus:bg-white"
            }`}
        />
        {suffix}
      </div>
      {errors[id] && <p className="mt-1.5 text-xs text-rose-600">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field id="firstName" label="First name" icon={User} placeholder="John" />
              <Field id="lastName"  label="Last name"  icon={User} placeholder="Doe"  />
            </div>
            <Field id="email"  label="Email address" icon={Mail}  type="email" placeholder="you@example.com" />
            <Field id="mobile" label="Mobile number" icon={Phone} type="tel"   placeholder="9876543210" />

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"}
                  value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition
                    focus:ring-2 focus:border-transparent
                    ${errors.password ? "border-rose-400 bg-rose-50 focus:ring-rose-300" : "border-slate-200 bg-slate-50 focus:ring-indigo-400 focus:bg-white"}`}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword" name="confirmPassword" type={showCp ? "text" : "password"}
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition
                    focus:ring-2 focus:border-transparent
                    ${errors.confirmPassword ? "border-rose-400 bg-rose-50 focus:ring-rose-300" : "border-slate-200 bg-slate-50 focus:ring-indigo-400 focus:bg-white"}`}
                />
                <button type="button" onClick={() => setShowCp((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showCp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white
                transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <><UserPlus className="h-4 w-4" /> Create account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}