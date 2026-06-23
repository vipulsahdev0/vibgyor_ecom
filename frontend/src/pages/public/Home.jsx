import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Package,
  ChevronRight,
  Star,
  Tag,
} from "lucide-react";
import { getCategories } from "../../api/categoryApi";

const FEATURES = [
  { icon: <ShoppingBag className="h-4 w-4" />, label: "Shop across curated categories" },
  { icon: <Star className="h-4 w-4" />, label: "Popular picks and essentials" },
  { icon: <TrendingUp className="h-4 w-4" />, label: "Fresh arrivals added often" },
  { icon: <Sparkles className="h-4 w-4" />, label: "Clean and fast browsing" },
];

const PALETTE = [
  "from-violet-500/10 to-violet-500/0 text-violet-600",
  "from-sky-500/10 to-sky-500/0 text-sky-600",
  "from-emerald-500/10 to-emerald-500/0 text-emerald-600",
  "from-amber-500/10 to-amber-500/0 text-amber-600",
  "from-rose-500/10 to-rose-500/0 text-rose-600",
  "from-teal-500/10 to-teal-500/0 text-teal-600",
];

const normalizeCategory = (c) => ({
  id: c?.id,
  name: c?.name ?? c?.categoryName ?? "",
  description: c?.description ?? "",
  imageUrl: c?.imageUrl ?? "",
  status: c?.status ?? "ACTIVE",
  productCount: Number(c?.productCount ?? 0),
});

function CategorySkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function CategoryCard({ category, index }) {
  const accent = PALETTE[index % PALETTE.length];

  return (
    <Link
      to={`/products?categoryId=${category.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${accent}`}>
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Tag className="h-10 w-10 opacity-70" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <Package className="h-3.5 w-3.5" />
            {category.productCount} {category.productCount === 1 ? "product" : "products"}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {category.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
              {category.description || "Browse products in this category."}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories({ status: "ACTIVE" });
      setCategories(data.map(normalizeCategory).slice(0, 8));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, item) => sum + item.productCount, 0),
    [categories]
  );

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_35%)]" />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            Welcome to Vibgyor E-Commerce
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Shop smarter across categories that actually fit how people browse.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore active categories, jump into filtered products instantly, and discover
            essentials, trending picks, and fresh arrivals in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore Products
            </Link>

            <Link
              to="/categories"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              View Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-2 text-xs text-white/80">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
              {categories.length} active categories
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
              {totalProducts} listed products
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap gap-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80"
            >
              {feature.icon}
              {feature.label}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Browse
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Shop by category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump straight into product collections that are live right now.
            </p>
          </div>

          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <Tag className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No active categories available.</p>
            <p className="mt-1 text-sm text-slate-500">
              As categories become active, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}