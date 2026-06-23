import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Package,
  Plus,
  Pencil,
  Search,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Tag,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductForm from "../../components/products/ProductForm";
import StatCard from "../../components/shared/StatCard";
import TableSkeleton from "../../components/shared/TableSkeleton";
import ErrorBanner from "../../components/shared/ErrorBanner";
import PageHeader from "../../components/shared/PageHeader";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getProductImage = (product) =>
  product?.primaryImageUrl ||
  product?.imageUrl ||
  product?.images?.find((img) => img?.isPrimary)?.imageUrl ||
  product?.images?.[0]?.imageUrl ||
  "";

const normalizeProduct = (product) => ({
  ...product,
  id: product?.id,
  name: product?.name ?? "",
  description: product?.description ?? "",
  status: product?.status ?? "INACTIVE",
  categoryId: product?.categoryId ?? null,
  categoryName: product?.categoryName ?? "",
  price: Number(product?.price ?? 0),
  discountedPrice:
    product?.discountedPrice == null ? null : Number(product.discountedPrice),
  finalPrice: Number(product?.finalPrice ?? product?.price ?? 0),
  stockQuantity: Number(product?.stockQuantity ?? product?.stock ?? 0),
  primaryImageUrl: getProductImage(product),
  images: Array.isArray(product?.images) ? product.images : [],
});

const normalizeCategory = (category) => ({
  ...category,
  id: category?.id,
  name: category?.name ?? category?.categoryName ?? "",
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const response = await getProducts();
      const list =
        response?.content ??
        response?.data?.content ??
        response?.data ??
        response ??
        [];

      setProducts(Array.isArray(list) ? list.map(normalizeProduct) : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data.map(normalizeCategory) : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const closeForm = () => {
    setSelectedProduct(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      await createProduct(data);
      toast.success("Product created");
      await fetchProducts(true);
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedProduct?.id) return;

    try {
      setFormLoading(true);
      await updateProduct(selectedProduct.id, data);
      toast.success("Product updated");
      await fetchProducts(true);
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatus = async (product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    if (
      !window.confirm(
        `${nextStatus === "INACTIVE" ? "Deactivate" : "Activate"} "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      setStatusLoadingId(product.id);
      await updateProductStatus(product.id, nextStatus);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, status: nextStatus } : item
        )
      );

      toast.success(
        `Product ${nextStatus === "ACTIVE" ? "activated" : "deactivated"}`
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update status");
    } finally {
      setStatusLoadingId(null);
    }
  };

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [String(category.id), category.name])),
    [categories]
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === "ACTIVE").length,
      inactive: products.filter((product) => product.status === "INACTIVE").length,
      lowStock: products.filter((product) => product.stockQuantity <= 5).length,
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        String(product.id).includes(query) ||
        product.categoryName.toLowerCase().includes(query);

      const matchStatus =
        filterStatus === "ALL" || product.status === filterStatus;

      const matchCategory =
        filterCategory === "ALL" ||
        String(product.categoryId) === filterCategory;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [products, search, filterStatus, filterCategory]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-7 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <TableSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog, prices, and availability."
        onRefresh={() => fetchProducts(true)}
        refreshing={refreshing}
      >
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total" value={stats.total} accent="slate" Icon={Package} />
        <StatCard title="Active" value={stats.active} accent="emerald" Icon={ToggleRight} />
        <StatCard title="Inactive" value={stats.inactive} accent="rose" Icon={ToggleLeft} />
        <StatCard title="Low Stock" value={stats.lowStock} accent="amber" Icon={AlertTriangle} />
      </div>

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                {selectedProduct ? (
                  <Pencil className="h-3.5 w-3.5 text-indigo-600" />
                ) : (
                  <Plus className="h-3.5 w-3.5 text-indigo-600" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedProduct ? `Edit "${selectedProduct.name}"` : "New Product"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Fill in the product details below
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-200 p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <ProductForm
              initialData={selectedProduct}
              categories={categories}
              onSubmit={selectedProduct ? handleUpdate : handleCreate}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex gap-1.5">
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  filterStatus === status
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!filteredProducts.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <Package className="h-8 w-8 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {search || filterStatus !== "ALL" || filterCategory !== "ALL"
                ? "No products match your filters"
                : "No products yet"}
            </p>

            {search || filterStatus !== "ALL" || filterCategory !== "ALL" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("ALL");
                  setFilterCategory("ALL");
                }}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreate}
                className="mx-auto mt-3 flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add your first product
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                          index === 5 ? "text-right" : "text-left"
                        }`}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => {
                  const isStatusLoading = statusLoadingId === product.id;
                  const stock = product.stockQuantity;
                  const categoryName =
                    categoryMap[String(product.categoryId)] ||
                    product.categoryName ||
                    "—";
                  const imageUrl = product.primaryImageUrl;

                  return (
                    <tr
                      key={product.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              loading="lazy"
                              className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                              <Package className="h-4 w-4 text-slate-400" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              ID #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                          <Tag className="h-3 w-3" />
                          {categoryName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold tabular-nums text-slate-900">
                            {formatCurrency(product.finalPrice || product.price)}
                          </span>
                          {product.discountedPrice != null &&
                            Number(product.discountedPrice) < Number(product.price) && (
                              <span className="text-xs tabular-nums text-slate-400 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            stock <= 5
                              ? "text-rose-600"
                              : stock <= 20
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}
                        >
                          {stock}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            STATUS_STYLES[product.status] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isStatusLoading}
                            onClick={() => handleStatus(product)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-60 ${
                              product.status === "ACTIVE"
                                ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {isStatusLoading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Updating
                              </>
                            ) : product.status === "ACTIVE" ? (
                              <>
                                <ToggleLeft className="h-3.5 w-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-3.5 w-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredProducts.map((product) => {
              const isStatusLoading = statusLoadingId === product.id;
              const stock = product.stockQuantity;
              const categoryName =
                categoryMap[String(product.categoryId)] ||
                product.categoryName ||
                "—";
              const imageUrl = product.primaryImageUrl;

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          width={44}
                          height={44}
                          loading="lazy"
                          className="h-11 w-11 shrink-0 rounded-xl border border-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ID #{product.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        STATUS_STYLES[product.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      <Tag className="h-3 w-3" />
                      {categoryName}
                    </span>

                    <span className="font-bold tabular-nums text-slate-900">
                      {formatCurrency(product.finalPrice || product.price)}
                    </span>

                    <span
                      className={`font-semibold tabular-nums ${
                        stock <= 5 ? "text-rose-600" : "text-slate-600"
                      }`}
                    >
                      Stock: {stock}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isStatusLoading}
                      onClick={() => handleStatus(product)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-60 ${
                        product.status === "ACTIVE"
                          ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {isStatusLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Updating
                        </>
                      ) : product.status === "ACTIVE" ? (
                        <>
                          <ToggleLeft className="h-3.5 w-3.5" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}