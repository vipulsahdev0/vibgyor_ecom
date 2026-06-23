import { useMemo, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  Search,
  Package,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [keyword, setKeyword] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const cartCount = useMemo(
    () => Number(cart?.totalItems ?? cart?.items?.length ?? 0),
    [cart]
  );

  const wishlistCount = useMemo(
    () => Number(wishlist?.totalItems ?? wishlist?.length ?? 0),
    [wishlist]
  );

  const avatar = (
    user?.firstName?.charAt(0) ??
    user?.email?.charAt(0) ??
    "U"
  ).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMobileOpen(false);
      setUserMenuOpen(false);
      navigate("/", { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = keyword.trim();
    navigate(value ? `/products?keyword=${encodeURIComponent(value)}` : "/products");
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-700 hover:bg-slate-50"
    }`;

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md";

  const badge =
    "absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-shadow ${
          scrolled ? "shadow-md shadow-slate-200/60" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-300/30">
              V
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">
                Vibgyor
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                E-Commerce
              </p>
            </div>
          </Link>

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

          <form onSubmit={handleSearch} className="hidden flex-1 lg:flex lg:max-w-xl">
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products, categories..."
                aria-label="Search products"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </form>

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

                <Link to="/account/wishlist" className={iconBtn} aria-label="Wishlist">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className={badge}>{wishlistCount > 9 ? "9+" : wishlistCount}</span>
                  )}
                </Link>

                <Link to="/account/cart" className={iconBtn} aria-label="Cart">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className={badge}>{cartCount > 9 ? "9+" : cartCount}</span>
                  )}
                </Link>

                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 rounded-2xl px-2 py-1.5 transition hover:bg-slate-100"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                      {avatar}
                    </div>

                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-semibold leading-tight text-slate-900">
                        {user.firstName || "Account"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isAdmin ? "Administrator" : "My Account"}
                      </p>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-100 bg-slate-50/80 p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-white">
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

                      <div className="p-2">
                        <Link
                          to="/account/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <User size={18} />
                          My Profile
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Package size={18} />
                          My Orders
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                          >
                            <LayoutDashboard size={18} />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
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
                <Link to="/account/cart" className={iconBtn} aria-label="Cart">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className={badge}>{cartCount > 9 ? "9+" : cartCount}</span>
                  )}
                </Link>

                <Link
                  to="/login"
                  className="ml-1 inline-flex items-center gap-1.5 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >
                  <User size={16} />
                  Login
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white md:hidden">
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </form>

              {user && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              )}

              <NavLink to="/" end className={mobileNavClass}>Home</NavLink>
              <NavLink to="/products" className={mobileNavClass}>Products</NavLink>
              <NavLink to="/categories" className={mobileNavClass}>Categories</NavLink>

              {user ? (
                <>
                  <NavLink to="/account/profile" className={mobileNavClass}>
                    Profile
                  </NavLink>

                  <NavLink to="/account/cart" className={mobileNavClass}>
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink to="/account/wishlist" className={mobileNavClass}>
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </NavLink>

                  {isAdmin && (
                    <NavLink to="/admin/dashboard" className={mobileNavClass}>
                      <span className="flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </span>
                    </NavLink>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <User size={16} />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close mobile menu backdrop"
          className="fixed inset-0 z-40 bg-slate-950/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}