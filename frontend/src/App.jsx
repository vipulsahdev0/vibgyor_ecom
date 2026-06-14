import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import Categories from "./pages/public/Categories";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import Dashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import OrderDetails from "./pages/user/OrderDetails";

import Profile from "./pages/user/Profile";
import Cart from "./pages/user/Cart";
import Wishlist from "./pages/user/Wishlist";
import Checkout from "./pages/user/Checkout";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import UserOrders from "./pages/user/Orders";
import NotFound from "./pages/public/NotFound";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#fff",
          },
        }}
      />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route
            path="payment-success/:orderId"
            element={<PaymentSuccess />}
          />
        </Route>

        <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
        <Route path="/cart" element={<Navigate to="/account/cart" replace />} />
        <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
        <Route path="/checkout" element={<Navigate to="/account/checkout" replace />} />
        <Route path="/payment-success" element={<Navigate to="/account/payment-success" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}