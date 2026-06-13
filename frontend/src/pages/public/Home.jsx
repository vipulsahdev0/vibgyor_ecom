import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ShoppingBag,
  Tag,
  Sparkles,
  TrendingUp,
  Package,
  ChevronRight,
  Star,
} from "lucide-react";

// ─── Per-category accent palette ─────────────────────────────────────────────
const PALETTE = [
  { bg: "bg-violet-50",  border: "border-violet-200",  icon: "text-violet-500",  ring: "group-hover:ring-violet-200"  },
  { bg: "bg-sky-50",     border: "border-sky-200",     icon: "text-sky-500",     ring: "group-hover:ring-sky-200"     },
  { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", ring: "group-hover:ring-emerald-200" },
  { bg: "bg-amber-50",   border: "border-amber-200",   icon: "text-amber-500",   ring: "group-hover:ring-amber-200"   },
  { bg: "bg-rose-50",    border: "border-rose-200",    icon: "text-rose-500",    ring: "group-hover:ring-rose-200"    },
  { bg: "bg-teal-50",    border: "border-teal-200",    icon: "text-teal-500",    ring: "group-hover:ring-teal-200"    },
  { bg: "bg-orange-50",  border: "border-orange-200",  icon: "text-orange-500",  ring: "group-hover:ring-orange-200"  },
  { bg: "bg-pink-50",    border: "border-pink-200",    icon: "text-pink-500",    ring: "group-hover:ring-pink-200"    },
];
const getColor = (i) => PALETTE[i % PALETTE.length];

// ─── Category Card Skeleton ───────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 animate-pulse space-y-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 mx-auto" />
      <div className="h-4 bg-slate-100 rounded-full w-2/3 mx-auto" />
      <div className="h-3 bg-slate-100 rounded-full w-full" />
      <div className="h-3 bg-slate-100 rounded-full w-4/5 mx-auto" />
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ category, index }) {
  const c = getColor(index);
  return (
    <Link
      to={`/products?categoryId=${category.id}`}
      className={`group relative flex flex-col items-center text-center rounded-2xl bg-white border ${c.border} p-5 shadow-sm hover:shadow-md ring-2 ring-transparent ${c.ring} transition-all duration-200 focus-visible:outline-none focus-visible:ring-indigo-400`}
    >
      {/* Icon bubble */}
      <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
        <Tag className={`w-5 h-5 ${c.icon}`} />
      </div>

      <h3 className="text-[14px] font-semibold text-slate-900 leading-snug truncate w-full">
        {category.categoryName}
      </h3>

      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {category.description || "Browse products in this category."}
      </p>

      {category.productCount != null && (
        <span className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <Package className="w-3 h-3" />
          {category.productCount} products
        </span>
      )}

      <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200 ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-150`} />
    </Link>
  );
}

// ─── Feature Pills ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <ShoppingBag className="w-4 h-4" />, label: "Free shipping over ₹499" },
  { icon: <Star className="w-4 h-4" />,        label: "Verified reviews" },
  { icon: <TrendingUp className="w-4 h-4" />,  label: "New arrivals daily" },
  { icon: <Sparkles className="w-4 h-4" />,    label: "Exclusive deals" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const active = (Array.isArray(data) ? data : [])
        .filter((c) => c.status === "ACTIVE")
        .slice(0, 8);
      setCategories(active);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <div className="space-y-14">

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 sm:p-12 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Welcome to Vibgyor Ecommerce
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Shop Smarter,{" "}
            <span className="text-yellow-300">Live Better</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-indigo-100 leading-relaxed max-w-lg">
            Discover thousands of products across curated categories — from essentials
            to exclusives, all in one clean experience.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Products
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              View Categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-2">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm"
            >
              {f.icon}
              {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories Section ────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Browse</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <Tag className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No categories available right now.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}