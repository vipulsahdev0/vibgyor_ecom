import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X, Package, RefreshCw, ChevronDown, Tag } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductGrid from "../../components/products/ProductGrid";

// ─── Toolbar Skeleton ─────────────────────────────────────────────────────────
function ToolbarSkeleton() {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse lg:flex-row lg:items-center">
      <div className="h-10 w-full rounded-xl bg-slate-100 lg:max-w-md" />
      <div className="flex gap-3 ml-auto">
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Active Filter Chip ───────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700">
      {label}
      <button
        onClick={onRemove}
        className="text-indigo-400 hover:text-indigo-700 transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Empty / No-results State ─────────────────────────────────────────────────
function EmptyState({ search, categoryName, onClear }) {
  const hasFilters = search || categoryName;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        {hasFilters ? "No products match your filters" : "No products yet"}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs mb-5">
        {hasFilters
          ? "Try adjusting your search or removing a filter."
          : "Products will appear here once they are added."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch]           = useState("");
  const [sort, setSort]               = useState("latest");
  const [priceRange, setPriceRange]   = useState("all"); // "all" | "0-500" | "500-2000" | "2000+"

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");

  // ── Fetch products ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const params = {};
      if (selectedCategoryId) params.categoryId = Number(selectedCategoryId);
      const data = await getProducts(params);
      setProducts(Array.isArray(data) ? data : []);
      if (isRefresh) toast.success("Products refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategoryId]);

  // ── Fetch categories for the filter dropdown ────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const active = (Array.isArray(data) ? data : []).filter((c) => c.status === "ACTIVE");
      setCategories(active);
    } catch (_) { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // ── Derived state ───────────────────────────────────────────────────────
  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const priceFilter = useCallback((price) => {
    const p = Number(price ?? 0);
    if (priceRange === "0-500")    return p <= 500;
    if (priceRange === "500-2000") return p > 500 && p <= 2000;
    if (priceRange === "2000+")    return p > 2000;
    return true;
  }, [priceRange]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    list = list.filter((p) => priceFilter(p.finalPrice ?? p.price));

    switch (sort) {
      case "low":
        list.sort((a, b) => Number(a.finalPrice ?? a.price ?? 0) - Number(b.finalPrice ?? b.price ?? 0));
        break;
      case "high":
        list.sort((a, b) => Number(b.finalPrice ?? b.price ?? 0) - Number(a.finalPrice ?? a.price ?? 0));
        break;
      case "name":
        list.sort((a, b) => a.productName?.localeCompare(b.productName));
        break;
      default:
        break;
    }

    return list;
  }, [products, search, sort, priceFilter]);

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    priceRange !== "all" ? 1 : 0,
    selectedCategoryId ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSearch("");
    setSort("latest");
    setPriceRange("all");
    setSearchParams({});
  };

  const removeCategoryFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("categoryId");
    setSearchParams(next);
  };

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-10 sm:px-12 text-white">
        <div className="pointer-events-none absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            {selectedCategory && (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Tag className="w-3 h-3 text-yellow-300" />
                {selectedCategory.categoryName}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {selectedCategory ? selectedCategory.categoryName : "Discover Products"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-100 max-w-lg leading-relaxed">
              {selectedCategory?.description ||
                "Explore curated products with smart filtering, sorting, and real-time search."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!loading && (
              <span className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                {products.length} products
              </span>
            )}
            <button
              onClick={() => fetchProducts(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-40 backdrop-blur-sm"
              aria-label="Refresh products"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="relative z-10 mt-5 flex items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-white/90">{selectedCategory.categoryName}</span>
            </>
          )}
        </nav>
      </section>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {loading ? (
        <ToolbarSkeleton />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition"
                aria-label="Search products"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap lg:ml-auto">
              {/* Category filter */}
              {categories.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedCategoryId || ""}
                    onChange={(e) => {
                      const next = new URLSearchParams(searchParams);
                      if (e.target.value) next.set("categoryId", e.target.value);
                      else next.delete("categoryId");
                      setSearchParams(next);
                    }}
                    className="appearance-none text-sm border border-slate-200 rounded-xl bg-white text-slate-700 pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.categoryName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* Price range */}
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="appearance-none text-sm border border-slate-200 rounded-xl bg-white text-slate-700 pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  aria-label="Filter by price"
                >
                  <option value="all">All Prices</option>
                  <option value="0-500">Under ₹500</option>
                  <option value="500-2000">₹500 – ₹2,000</option>
                  <option value="2000+">Above ₹2,000</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-sm border border-slate-200 rounded-xl bg-white text-slate-700 pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  aria-label="Sort products"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="name">Name: A → Z</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 text-sm rounded-xl border px-3 py-2.5 transition-colors lg:hidden ${
                  activeFilterCount > 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-50">
              <span className="text-xs text-slate-400 font-medium">Active:</span>
              {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />}
              {priceRange !== "all" && (
                <FilterChip
                  label={priceRange === "0-500" ? "Under ₹500" : priceRange === "500-2000" ? "₹500–₹2,000" : "Above ₹2,000"}
                  onRemove={() => setPriceRange("all")}
                />
              )}
              {selectedCategoryId && selectedCategory && (
                <FilterChip label={selectedCategory.categoryName} onRemove={removeCategoryFilter} />
              )}
              <button
                onClick={clearAllFilters}
                className="ml-1 text-xs text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
              <span className="ml-auto text-xs text-slate-400">
                {filteredProducts.length} of {products.length} products
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      {!loading && filteredProducts.length === 0 ? (
        <EmptyState
          search={search}
          categoryName={selectedCategory?.categoryName}
          onClear={clearAllFilters}
        />
      ) : (
        <ProductGrid products={filteredProducts} loading={loading} />
      )}

      {/* ── Results summary ───────────────────────────────────────────────── */}
      {!loading && filteredProducts.length > 0 && activeFilterCount === 0 && (
        <p className="text-center text-xs text-slate-400 pb-4">
          Showing all {filteredProducts.length} products
        </p>
      )}
    </div>
  );
}