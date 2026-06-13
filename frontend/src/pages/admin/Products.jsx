import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Package, Plus, ToggleLeft, ToggleRight, RefreshCw,
  AlertCircle, Search, Loader2, AlertTriangle,
  X, Filter, Tag, IndianRupee, Boxes,
} from "lucide-react";
import { createProduct, getProducts, updateProductStatus } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductForm from "../../components/products/ProductForm";

// ── helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v || 0));

const STATUS_STYLES = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
};

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

function getProductImage(product) {
  return product.primaryImageUrl
    || product.images?.find(i => i.isPrimary)?.imageUrl
    || product.images?.[0]?.imageUrl
    || PLACEHOLDER;
}

function buildPayload(formData) {
  return {
    name:            formData.name?.trim(),
    description:     formData.description?.trim() || "",
    price:           Number(formData.price),
    discountedPrice: formData.discountedPrice !== "" && formData.discountedPrice != null
                       ? Number(formData.discountedPrice) : null,
    sku:             formData.sku?.trim() || null,
    stockQuantity:   Number(formData.stockQuantity),
    status:          formData.status || "ACTIVE",
    categoryId:      Number(formData.categoryId),
    images:          Array.isArray(formData.images)
      ? formData.images
          .filter(img => img?.imageUrl?.trim())
          .map((img, i) => ({
            imageUrl:     img.imageUrl.trim(),
            isPrimary:    Boolean(img.isPrimary ?? i === 0),
            displayOrder: img.displayOrder != null ? Number(img.displayOrder) : i,
          }))
      : [],
  };
}

// ── sub-components ─────────────────────────────────────────────────────────────
function StatCard({ title, value, accent, Icon, warn }) {
  const map = {
    slate:   { bg: "bg-slate-50",   icon: "text-slate-500",   val: "text-slate-900"   },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", val: "text-emerald-700" },
    rose:    { bg: "bg-rose-50",    icon: "text-rose-500",    val: "text-rose-700"    },
    amber:   { bg: "bg-amber-50",   icon: "text-amber-500",   val: "text-amber-700"   },
  };
  const c = map[accent] ?? map.slate;
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${warn && value > 0 ? "border-amber-200" : "border-slate-100"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 text-2xl font-black tabular-nums ${c.val}`}>{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.icon}`} />
        </div>
      </div>
      {warn && value > 0 && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-600">
          <AlertTriangle className="h-3 w-3" /> Needs restocking
        </p>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
      </div>
    </section>
  );
}

// Product card
function ProductCard({ product, onStatusToggle, isUpdating }) {
  const imageUrl   = getProductImage(product);
  const hasDiscount = product.discountedPrice != null && Number(product.discountedPrice) < Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;
  const isLowStock = Number(product.stockQuantity || 0) <= 5;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img src={imageUrl} alt={product.name}
          width={600} height={400} loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />

        {/* Overlays */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[product.status] ?? "bg-slate-100 text-slate-600"}`}>
            {product.status}
          </span>
          {hasDiscount && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
              -{discountPct}%
            </span>
          )}
        </div>

        {isLowStock && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
            <AlertTriangle className="h-3 w-3" /> Low Stock
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-slate-900">{product.name}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Tag className="h-3 w-3" />{product.categoryName || "Uncategorized"}
            </p>
          </div>
          {product.sku && (
            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500">
              {product.sku}
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>
        )}

        {/* Pricing + Stock grid */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
          <div className="flex flex-col items-center py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</p>
            <p className={`mt-0.5 text-xs font-bold tabular-nums ${hasDiscount ? "line-through text-slate-400" : "text-slate-900"}`}>
              {formatCurrency(product.price)}
            </p>
          </div>
          <div className="flex flex-col items-center py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Final</p>
            <p className="mt-0.5 text-xs font-black tabular-nums text-indigo-700">
              {formatCurrency(product.finalPrice ?? product.discountedPrice ?? product.price)}
            </p>
          </div>
          <div className="flex flex-col items-center py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stock</p>
            <p className={`mt-0.5 text-xs font-bold tabular-nums ${isLowStock ? "text-amber-600" : "text-slate-900"}`}>
              {product.stockQuantity ?? 0}
            </p>
          </div>
        </div>

        {/* Action */}
        <button onClick={() => onStatusToggle(product)} disabled={isUpdating}
          className={`mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
            product.status === "ACTIVE"
              ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}>
          {isUpdating
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
            : product.status === "ACTIVE"
              ? <><ToggleLeft className="h-3.5 w-3.5" /> Deactivate</>
              : <><ToggleRight className="h-3.5 w-3.5" /> Activate</>
          }
        </button>
      </div>
    </article>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products,          setProducts]          = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [formLoading,       setFormLoading]       = useState(false);
  const [fetching,          setFetching]          = useState(true);
  const [refreshing,        setRefreshing]        = useState(false);
  const [statusLoadingId,   setStatusLoadingId]   = useState(null);
  const [error,             setError]             = useState("");
  const [search,            setSearch]            = useState("");
  const [selectedCategoryId,setSelectedCategoryId]= useState("ALL");
  const [selectedStatus,    setSelectedStatus]    = useState("ALL");
  const [showForm,          setShowForm]          = useState(false);

  const initializePage = useCallback(async (silent = false) => {
    try {
      if (!silent) setFetching(true); else setRefreshing(true);
      setError("");
      const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(Array.isArray(productsData)   ? productsData   : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products and categories.");
      toast.error("Failed to load data");
    } finally { setFetching(false); setRefreshing(false); }
  }, []);

  useEffect(() => { initializePage(); }, [initializePage]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      await createProduct(buildPayload(formData));
      toast.success("Product created successfully");
      await initializePage(true);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally { setFormLoading(false); }
  };

  const handleStatus = async (product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`${nextStatus === "INACTIVE" ? "Deactivate" : "Activate"} "${product.name}"?`)) return;
    try {
      setStatusLoadingId(product.id);
      await updateProductStatus(product.id, nextStatus);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: nextStatus } : p));
      toast.success("Product status updated");
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to update product status");
    } finally { setStatusLoadingId(null); }
  };

  const stats = useMemo(() => ({
    total:    products.length,
    active:   products.filter(p => p.status === "ACTIVE").length,
    inactive: products.filter(p => p.status === "INACTIVE").length,
    lowStock: products.filter(p => Number(p.stockQuantity || 0) <= 5).length,
  }), [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch  = !search  || [p.name, p.categoryName, p.sku].some(v => v?.toLowerCase().includes(q));
    const matchCat     = selectedCategoryId === "ALL" || String(p.categoryId) === String(selectedCategoryId);
    const matchStatus  = selectedStatus === "ALL" || p.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  }), [products, search, selectedCategoryId, selectedStatus]);

  const clearFilters = () => { setSearch(""); setSelectedCategoryId("ALL"); setSelectedStatus("ALL"); };
  const isFiltered = search || selectedCategoryId !== "ALL" || selectedStatus !== "ALL";

  if (fetching) return <PageSkeleton />;

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Create products, manage inventory, and control visibility.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={() => initializePage(true)} disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${
              showForm
                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}>
            {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add Product</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total"    value={stats.total}    accent="slate"   Icon={Package}       />
        <StatCard title="Active"   value={stats.active}   accent="emerald" Icon={ToggleRight}   />
        <StatCard title="Inactive" value={stats.inactive} accent="rose"    Icon={ToggleLeft}    />
        <StatCard title="Low Stock" value={stats.lowStock} accent="amber"  Icon={AlertTriangle} warn />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button onClick={() => initializePage()}
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
            Retry
          </button>
        </div>
      )}

      {/* Inline create form */}
      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                <Plus className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">New Product</p>
                <p className="text-[11px] text-slate-400">Fill in product details below</p>
              </div>
            </div>
            <button onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <ProductForm categories={categories} onSubmit={handleCreate} loading={formLoading} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, category, or SKU…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div className="flex gap-2">
          <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Results meta */}
      {isFiltered && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of{" "}
            <span className="font-bold text-slate-900">{products.length}</span> products
          </p>
          <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Empty */}
      {!filteredProducts.length && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Package className="h-9 w-9 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isFiltered ? "No products match your filters" : "No products yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isFiltered ? "Try adjusting your search or filters." : "Click 'Add Product' to create your first product."}
            </p>
            {isFiltered && (
              <button onClick={clearFilters} className="mt-2 text-xs text-indigo-600 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onStatusToggle={handleStatus}
              isUpdating={statusLoadingId === product.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}