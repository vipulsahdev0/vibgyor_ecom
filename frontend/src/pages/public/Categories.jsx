import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { getCategories } from "../../api/categoryApi";
import { Link } from "react-router-dom";
import { Search, LayoutGrid, List, RefreshCw, Tag, ChevronRight, Package, Sparkles } from "lucide-react";

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-6 animate-pulse space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded-full w-2/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        <div className="h-3 bg-slate-100 rounded-full w-4/5" />
      </div>
      <div className="flex justify-between items-center pt-1">
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query, onClear }) {
  if (query) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
          <Search className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No results for "{query}"</h3>
        <p className="text-sm text-slate-400 mb-5 max-w-xs">
          Try a different search term or clear the filter.
        </p>
        <button
          onClick={onClear}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Clear search
        </button>
      </div>
    );
  }
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
        <Tag className="w-7 h-7 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No categories yet</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        Active categories will appear here once they are created.
      </p>
    </div>
  );
}

// ─── Per-category accent colors (cycles through palette) ─────────────────────
const CATEGORY_COLORS = [
  { bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-500", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-sky-50",    border: "border-sky-100",    icon: "text-sky-500",    badge: "bg-sky-100 text-sky-700" },
  { bg: "bg-emerald-50",border: "border-emerald-100",icon: "text-emerald-500",badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-amber-50",  border: "border-amber-100",  icon: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50",   border: "border-rose-100",   icon: "text-rose-500",   badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-teal-50",   border: "border-teal-100",   icon: "text-teal-500",   badge: "bg-teal-100 text-teal-700" },
];
const getColor = (idx) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

// ─── Grid Card ────────────────────────────────────────────────────────────────
function CategoryCard({ category, index }) {
  const c = getColor(index);
  const count = category.productCount ?? 0;
  return (
    <article className={`group relative rounded-2xl bg-white border ${c.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
            <Tag className={`w-5 h-5 ${c.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
              <Link to={`/products?categoryId=${category.id}`} className="hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:text-indigo-600">
                {category.categoryName}
              </Link>
            </h2>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
              {category.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {category.description || "No description available for this category."}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Package className="w-3.5 h-3.5" />
            {count} {count === 1 ? "product" : "products"}
          </span>
          <Link
            to={`/products?categoryId=${category.id}`}
            className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors group-hover:gap-1.5"
            aria-label={`Browse ${category.categoryName}`}
          >
            Browse <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function CategoryRow({ category, index }) {
  const c = getColor(index);
  const count = category.productCount ?? 0;
  return (
    <article className="group flex items-center gap-4 rounded-xl bg-white border border-slate-100 px-5 py-4 hover:shadow-sm hover:border-slate-200 transition-all duration-150">
      <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
        <Tag className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-[14px] font-semibold text-slate-800 truncate">
          <Link to={`/products?categoryId=${category.id}`} className="hover:text-indigo-600 transition-colors">
            {category.categoryName}
          </Link>
        </h2>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {category.description || "No description available."}
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
          <Package className="w-3.5 h-3.5" /> {count}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{category.status}</span>
        <Link to={`/products?categoryId=${category.id}`} aria-label={`Browse ${category.categoryName}`} className="text-slate-300 hover:text-indigo-500 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [view, setView]             = useState("grid");   // "grid" | "list"
  const [sortBy, setSortBy]         = useState("name");   // "name" | "products"

  const fetchCategories = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await getCategories();
      const active = (Array.isArray(data) ? data : []).filter((c) => c.status === "ACTIVE");
      setCategories(active);
      if (isRefresh) toast.success("Categories refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = useMemo(() => {
    let list = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.categoryName?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      );
    }
    return sortBy === "name"
      ? [...list].sort((a, b) => a.categoryName?.localeCompare(b.categoryName))
      : [...list].sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
  }, [categories, search, sortBy]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0),
    [categories]
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Catalog</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-400">
              {categories.length} active {categories.length === 1 ? "category" : "categories"} · {totalProducts} total products
            </p>
          )}
        </div>
        {!loading && (
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40 self-start sm:self-auto"
            aria-label="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Toolbar */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              aria-label="Search categories"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl bg-white text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              aria-label="Sort categories"
            >
              <option value="name">Sort: Name</option>
              <option value="products">Sort: Products</option>
            </select>
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1" role="group" aria-label="View mode">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                aria-label="Grid view" aria-pressed={view === "grid"}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                aria-label="List view" aria-pressed={view === "list"}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0
            ? <EmptyState query={search} onClear={() => setSearch("")} />
            : filtered.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.length === 0
            ? <EmptyState query={search} onClear={() => setSearch("")} />
            : filtered.map((cat, i) => <CategoryRow key={cat.id} category={cat} index={i} />)}
        </div>
      )}

      {/* Search results count */}
      {!loading && search && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {filtered.length} of {categories.length} categories match
        </p>
      )}
    </section>
  );
}