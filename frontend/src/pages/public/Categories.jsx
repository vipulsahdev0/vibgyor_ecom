import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Tag,
  ChevronRight,
  Package,
  Sparkles,
  ArrowUpDown,
  Image as ImageIcon,
} from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import EmptyState from "../../components/shared/EmptyState";

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
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function CategoryCard({ category }) {
  const count = category.productCount ?? 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products?categoryId=${category.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 via-black/25 to-transparent p-4">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {count} {count === 1 ? "product" : "products"}
            </span>
            <span className="rounded-full bg-emerald-400/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-950">
              {category.status}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900">
                {category.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                {category.description || "Browse products in this category."}
              </p>
            </div>

            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
          </div>
        </div>
      </Link>
    </article>
  );
}

function CategoryRow({ category }) {
  const count = category.productCount ?? 0;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 shrink-0">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Tag className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            <Link to={`/products?categoryId=${category.id}`} className="hover:text-indigo-600">
              {category.name}
            </Link>
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500">
            {category.description || "Browse products in this category."}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <Package className="h-3.5 w-3.5" />
          {count}
        </div>

        <Link
          to={`/products?categoryId=${category.id}`}
          aria-label={`Browse ${category.name}`}
          className="rounded-xl p-2 text-slate-300 transition hover:bg-slate-100 hover:text-indigo-500"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const search = searchParams.get("q") ?? "";
  const view = searchParams.get("view") ?? "grid";
  const sortBy = searchParams.get("sort") ?? "products";

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const fetchCategories = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await getCategories({ status: "ACTIVE" });
      setCategories(data.map(normalizeCategory));
      if (isRefresh) toast.success("Categories refreshed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    let list = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => b.productCount - a.productCount);
    }

    return list;
  }, [categories, search, sortBy]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + c.productCount, 0),
    [categories]
  );

  const featured = filtered[0];

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Catalog
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
            {!loading && (
              <p className="mt-1 text-sm text-slate-500">
                {categories.length} active categories · {totalProducts} total products
              </p>
            )}
          </div>

          {!loading && (
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>

        {!loading && featured && !search && (
          <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-4 lg:grid-cols-[1.3fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Featured by catalog size
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{featured.name}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {featured.description || "Browse this category to see its available products."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {featured.productCount} products
                </span>
                <Link
                  to={`/products?categoryId=${featured.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Browse now
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-slate-200">
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-44 items-center justify-center text-slate-300">
                  <Tag className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!loading && categories.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => updateParams({ q: e.target.value })}
              placeholder="Search categories"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="bg-transparent text-sm text-slate-700 outline-none"
                aria-label="Sort categories"
              >
                <option value="products">Top products</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => updateParams({ view: "grid" })}
                className={`rounded-xl p-2 ${view === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateParams({ view: "list" })}
                className={`rounded-xl p-2 ${view === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState query={search} onClear={() => updateParams({ q: null })} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      )}

      {!loading && search && filtered.length > 0 && (
        <p className="text-right text-xs text-slate-400">
          {filtered.length} of {categories.length} categories match your search
        </p>
      )}
    </section>
  );
}