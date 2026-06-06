import { useState } from "react";
import { registerUser } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.password.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
      });

      toast.success("Registration successful");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Register</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          placeholder="First Name"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          placeholder="Last Name"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="text"
          name="mobile"
          value={formData.mobile}
          placeholder="Mobile"
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
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-5 text-center text-slate-600">
        Already have an account?
        <Link to="/login" className="ml-2 font-semibold text-indigo-600">
          Login
        </Link>
      </p>
    </div>
  );
}