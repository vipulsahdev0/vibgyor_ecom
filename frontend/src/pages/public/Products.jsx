import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  ChevronDown,
  Tag,
  Package,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductGrid from "../../components/products/ProductGrid";
import EmptyState from "../../components/shared/EmptyState";

function ToolbarSkeleton() {
  return (
    <div className="mb-8 flex animate-pulse flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div className="h-10 w-full rounded-xl bg-slate-100 lg:max-w-md" />
      <div className="ml-auto flex gap-3">
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
        <div className="h-10 w-36 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      {label}
      <button
        onClick={onRemove}
        className="text-indigo-400 transition-colors hover:text-indigo-700"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryId = searchParams.get("categoryId") || "";
  const priceRange = searchParams.get("priceRange") || "all";
  const inStockOnly = searchParams.get("inStock") === "true";

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const getPriceParams = useCallback((range) => {
    switch (range) {
      case "0-500":
        return { minPrice: undefined, maxPrice: 500 };
      case "500-2000":
        return { minPrice: 500, maxPrice: 2000 };
      case "2000+":
        return { minPrice: 2000, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  }, []);

  const fetchProducts = useCallback(
    async (isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const { minPrice, maxPrice } = getPriceParams(priceRange);
        const params = {};

        if (selectedCategoryId) params.categoryId = Number(selectedCategoryId);
        if (search) params.keyword = search;
        if (typeof minPrice !== "undefined") params.minPrice = minPrice;
        if (typeof maxPrice !== "undefined") params.maxPrice = maxPrice;
        if (inStockOnly) params.inStock = true;

        const data = await getProducts(params);
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];

        setProducts(list);

        if (isRefresh) toast.success("Products refreshed");
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategoryId, search, priceRange, inStockOnly, getPriceParams]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const active = (Array.isArray(data) ? data : []).filter((c) => c.status === "ACTIVE");
      setCategories(active);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(selectedCategoryId)),
    [categories, selectedCategoryId]
  );

  const filteredProducts = useMemo(() => {
    const list = [...products];

    switch (sort) {
      case "low":
        list.sort(
          (a, b) =>
            Number(a?.finalPrice ?? a?.discountedPrice ?? a?.price ?? 0) -
            Number(b?.finalPrice ?? b?.discountedPrice ?? b?.price ?? 0)
        );
        break;

      case "high":
        list.sort(
          (a, b) =>
            Number(b?.finalPrice ?? b?.discountedPrice ?? b?.price ?? 0) -
            Number(a?.finalPrice ?? a?.discountedPrice ?? a?.price ?? 0)
        );
        break;

      case "name":
        list.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
        break;

      case "stock":
        list.sort((a, b) => Number(b?.stockQuantity ?? 0) - Number(a?.stockQuantity ?? 0));
        break;

      default:
        break;
    }

    return list;
  }, [products, sort]);

  const activeFilterCount = [
    search ? 1 : 0,
    priceRange !== "all" ? 1 : 0,
    selectedCategoryId ? 1 : 0,
    inStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === false ||
      value === "all"
    ) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }

    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearch("");
    setSort("latest");
    setSearchParams({});
  };

  const selectedCategoryLabel =
    selectedCategory?.name ?? selectedCategory?.categoryName ?? null;

  const heroDescription =
    selectedCategory?.description ||
    "Explore curated products with smarter search, backend-driven filtering, stock visibility, and refined browsing.";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 px-8 py-10 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            {selectedCategoryLabel && (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Tag className="h-3 w-3 text-yellow-300" />
                {selectedCategoryLabel}
              </div>
            )}

            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {selectedCategoryLabel || "Discover Products"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              {heroDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {!loading && (
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                {products.length} products
              </span>
            )}

            <button
              onClick={() => fetchProducts(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-40"
              aria-label="Refresh products"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <nav className="relative z-10 mt-5 flex items-center gap-1.5 text-xs text-white/60">
          <Link to="/" className="transition-colors hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/products" className="transition-colors hover:text-white">Products</Link>
          {selectedCategoryLabel && (
            <>
              <span>/</span>
              <span className="text-white/90">{selectedCategoryLabel}</span>
            </>
          )}
        </nav>
      </section>

      {loading ? (
        <ToolbarSkeleton />
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Search products"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {categories.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => updateParam("categoryId", e.target.value)}
                    className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ?? c.categoryName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              )}

              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => updateParam("priceRange", e.target.value)}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filter by price"
                >
                  <option value="all">All Prices</option>
                  <option value="0-500">Under ₹500</option>
                  <option value="500-2000">₹500 – ₹2,000</option>
                  <option value="2000+">Above ₹2,000</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Sort products"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="name">Name: A → Z</option>
                  <option value="stock">Stock: High → Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                onClick={() => updateParam("inStock", !inStockOnly || "")}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  inStockOnly
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="Toggle in-stock filter"
              >
                <CheckCircle2 className="h-4 w-4" />
                In Stock
              </button>

              <button
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition lg:hidden ${
                  activeFilterCount > 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-1">
              <span className="text-xs font-medium text-slate-400">Active:</span>

              {search && (
                <FilterChip
                  label={`"${search}"`}
                  onRemove={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                />
              )}

              {priceRange !== "all" && (
                <FilterChip
                  label={
                    priceRange === "0-500"
                      ? "Under ₹500"
                      : priceRange === "500-2000"
                      ? "₹500–₹2,000"
                      : "Above ₹2,000"
                  }
                  onRemove={() => updateParam("priceRange", "all")}
                />
              )}

              {selectedCategoryId && selectedCategoryLabel && (
                <FilterChip
                  label={selectedCategoryLabel}
                  onRemove={() => updateParam("categoryId", "")}
                />
              )}

              {inStockOnly && (
                <FilterChip
                  label="In Stock"
                  onRemove={() => updateParam("inStock", "")}
                />
              )}

              <button
                onClick={clearAllFilters}
                className="ml-1 text-xs text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-700"
              >
                Clear all
              </button>

              <span className="ml-auto text-xs text-slate-400">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {!loading && filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          message="No products match your current filters"
          submessage="Try changing the category, price range, stock filter, or search keyword."
          actionLabel="Clear filters"
          onAction={clearAllFilters}
        />
      ) : (
        <ProductGrid products={filteredProducts} loading={loading} />
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          Showing <span className="font-semibold text-slate-700">{filteredProducts.length}</span>{" "}
          result{filteredProducts.length !== 1 ? "s" : ""}
          {priceRange !== "all" && (
            <>
              {" "}in <span className="font-semibold text-slate-700">
                {priceRange === "0-500"
                  ? `Under ${formatCurrency(500)}`
                  : priceRange === "500-2000"
                  ? `${formatCurrency(500)} – ${formatCurrency(2000)}`
                  : `Above ${formatCurrency(2000)}`}
              </span>
            </>
          )}
          {selectedCategoryLabel && (
            <>
              {" "}for <span className="font-semibold text-slate-700">{selectedCategoryLabel}</span>
            </>
          )}
          {inStockOnly && (
            <>
              {" "}with <span className="font-semibold text-emerald-700">stock available</span>
            </>
          )}
          .
        </div>
      )}
    </div>
  );
}