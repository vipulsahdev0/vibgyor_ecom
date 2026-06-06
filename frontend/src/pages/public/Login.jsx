import { useState } from "react";
import { loginUser } from "../../api/authApi";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      login(data);
      toast.success("Login successful");

      const redirectTo = location.state?.from?.pathname;

      if (data.role === "ADMIN") {
        navigate(redirectTo || "/admin/dashboard", { replace: true });
      } else {
        navigate(redirectTo || "/account/profile", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-center text-slate-600">
        Don&apos;t have an account?
        <Link to="/register" className="ml-2 font-semibold text-indigo-600">
          Register
        </Link>
      </p>
    </div>
  );
}