import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
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

export default function UserLayout() {
  const { token } = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}