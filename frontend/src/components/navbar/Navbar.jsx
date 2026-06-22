import { useMemo, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, User, LogOut, Menu, X, LayoutDashboard, ChevronDown, Search } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function Navbar() {
  const {
    user,
    logout,
    isAdmin,
    isAuthenticated,
  } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMobileOpen(false);
      setUserMenuOpen(false);
      navigate("/", { replace: true });
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);


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
    "relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600";

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
          className="flex items-center gap-3"
        >
          <div
            className="
    flex h-10 w-10 items-center
    justify-center rounded-2xl
    bg-gradient-to-br
    from-violet-600
    to-fuchsia-600
    text-white shadow-lg
    "
          >
            V
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">
              Vibgyor
            </h1>

            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
              E-Commerce
            </p>
          </div>
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

        <div className="hidden lg:flex flex-1 max-w-xl mx-10">
          <div className="relative w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="
      w-full
      rounded-2xl
      border
      border-slate-200
      bg-slate-50
      py-3
      pl-11
      pr-4
      text-sm
      outline-none
      transition
      focus:border-violet-500
      focus:bg-white
      focus:ring-4
      focus:ring-violet-100
      "
            />
          </div>
        </div>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-1.5 md:flex">
          {user ? (
            <>
              {isAuthenticated && (
                <Link
                  to="/account/orders"
                  className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md">
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
                  <div
                    className="
  absolute right-0 z-50 mt-3 w-80
  rounded-3xl
  border border-violet-100
  bg-white
  shadow-2xl
  overflow-hidden
  backdrop-blur-xl
"
                  >
                    {/* User Header */}
                    <div className="p-5 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-semibold shadow-md">
                          {avatar}
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </h4>

                          <p className="truncate text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="
          flex items-center gap-3
          rounded-2xl
          px-4 py-3
          text-sm font-medium
          text-slate-700
          transition
          hover:bg-violet-50
        "
                      >
                        <User size={18} />
                        My Profile
                      </Link>

                      <Link
                        to="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="
          flex items-center gap-3
          rounded-2xl
          px-4 py-3
          text-sm font-medium
          text-slate-700
          transition
          hover:bg-violet-50
        "
                      >
                        <ShoppingCart size={18} />
                        My Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="
            flex items-center gap-3
            rounded-2xl
            px-4 py-3
            text-sm font-medium
            text-violet-700
            transition
            hover:bg-violet-50
          "
                        >
                          <LayoutDashboard size={18} />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="
          flex w-full items-center gap-3
          rounded-2xl
          px-4 py-3
          text-sm font-medium
          text-rose-600
          transition
          hover:bg-rose-50
        "
                      >
                        <LogOut size={18} />
                        Logout
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

            {user && (
              <div className="mb-3 rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  {user.email}
                </p>
              </div>
            )}

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