import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useMemo(() => {
    return Number(cart?.totalItems ?? cart?.items?.length ?? 0);
  }, [cart]);

  const wishlistCount = useMemo(() => {
    return Number(wishlist?.length ?? 0);
  }, [wishlist]);

  const navLinkClass = ({ isActive }) =>
    `transition font-medium ${
      isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"
    }`;

  const iconButtonClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600";

  const badgeClass =
    "absolute -right-1 -top-1 min-w-[20px] rounded-full bg-red-500 px-1.5 text-center text-[11px] font-semibold leading-5 text-white";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-indigo-600"
          onClick={closeMobileMenu}
        >
          Vibgyor
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>

          {isAdmin ? (
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/account/wishlist"
                className={iconButtonClass}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 ? (
                  <span className={badgeClass}>{wishlistCount}</span>
                ) : null}
              </Link>

              <Link
                to="/account/cart"
                className={iconButtonClass}
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 ? (
                  <span className={badgeClass}>{cartCount}</span>
                ) : null}
              </Link>

              <Link
                to="/account/profile"
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                aria-label="My profile"
                title="My profile"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold uppercase text-white">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.firstName || "Account"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? "Administrator" : "My Account"}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/account/cart"
                className={iconButtonClass}
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 ? (
                  <span className={badgeClass}>{cartCount}</span>
                ) : null}
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <User size={18} />
                Login
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-2 px-4 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
              onClick={closeMobileMenu}
            >
              Products
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`
              }
              onClick={closeMobileMenu}
            >
              Categories
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/account/profile"
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  Profile
                </NavLink>

                <NavLink
                  to="/account/cart"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <span>Cart</span>
                  {cartCount > 0 ? (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </NavLink>

                <NavLink
                  to="/account/wishlist"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 ? (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {wishlistCount}
                    </span>
                  ) : null}
                </NavLink>

                {isAdmin ? (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-4 py-3 font-medium ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard size={18} />
                    Admin Dashboard
                  </NavLink>
                ) : null}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
                onClick={closeMobileMenu}
              >
                <User size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}