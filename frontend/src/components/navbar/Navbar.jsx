import { useMemo, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, User, LogOut, Menu, X,
  LayoutDashboard, ChevronDown, Sparkles,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cartCount = useMemo(
    () => Number(cart?.totalItems ?? cart?.items?.length ?? 0),
    [cart]
  );

  const wishlistCount = useMemo(
    () => Number(wishlist?.totalItems ?? wishlist?.length ?? 0),
    [wishlist]
  );

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate("/", { replace: true });
  };

  const closeMobileMenu = () => setMobileOpen(false);

  // ── Shared style constants ───────────────────────────────────────────────
  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${isActive
      ? "text-indigo-600 bg-indigo-50"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
      ? "bg-indigo-50 text-indigo-600"
      : "text-slate-700 hover:bg-slate-50"
    }`;

  const iconBtn =
    "relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600";

  const badge =
    "absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white";

  const avatar = (user?.firstName?.charAt(0) ?? user?.email?.charAt(0) ?? "U").toUpperCase();

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-shadow duration-200 ${scrolled ? "shadow-md shadow-slate-200/60" : ""
        }`}
    >
      {/* ── Main bar ──────────────────────────────────────────────────── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2 font-black tracking-tight text-slate-900 hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-lg text-indigo-600">Vibgyor</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {[
            { to: "/", label: "Home" },
            { to: "/products", label: "Products" },
            { to: "/categories", label: "Categories" },
          ].map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} end={to === "/"} className={navLinkClass}>
                {label}
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-1.5 md:flex">
          {user ? (
            <>
              {isAuthenticated && (
                <Link
                  to="/account/orders"
                  className="..."
                >
                  Orders
                </Link>
              )}
              {/* Wishlist */}
              <Link to="/account/wishlist" className={iconBtn} aria-label="Wishlist" title="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && <span className={badge}>{wishlistCount > 9 ? "9+" : wishlistCount}</span>}
              </Link>

              {/* Cart */}
              <Link to="/account/cart" className={iconBtn} aria-label="Cart" title="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className={badge}>{cartCount > 9 ? "9+" : cartCount}</span>}
              </Link>

              {/* User dropdown */}
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold uppercase text-white shrink-0">
                    {avatar}
                  </div>
                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-semibold leading-tight text-slate-900">
                      {user.firstName || "Account"}
                    </p>
                    <p className="text-xs text-slate-400">{isAdmin ? "Administrator" : "My Account"}</p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-200/60 ring-1 ring-black/5">
                    {/* Header */}
                    <div className="border-b border-slate-50 px-4 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={15} className="text-slate-400" /> My Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-indigo-500" /> Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-50 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Guest cart */}
              <Link to="/account/cart" className={iconBtn} aria-label="Cart" title="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className={badge}>{cartCount > 9 ? "9+" : cartCount}</span>}
              </Link>

              <Link
                to="/login"
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.97]"
              >
                <User size={16} /> Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <NavLink to="/" end className={mobileNavClass} onClick={closeMobileMenu}>Home</NavLink>
            <NavLink to="/products" className={mobileNavClass} onClick={closeMobileMenu}>Products</NavLink>
            <NavLink to="/categories" className={mobileNavClass} onClick={closeMobileMenu}>Categories</NavLink>

            {user ? (
              <>
                <NavLink to="/account/profile" className={mobileNavClass} onClick={closeMobileMenu}>
                  Profile
                </NavLink>

                <NavLink to="/account/cart" className={mobileNavClass} onClick={closeMobileMenu}>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {cartCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/account/wishlist" className={mobileNavClass} onClick={closeMobileMenu}>
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </NavLink>

                {isAdmin && (
                  <NavLink to="/admin/dashboard" className={mobileNavClass} onClick={closeMobileMenu}>
                    <span className="flex items-center gap-2">
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </span>
                  </NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <User size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}