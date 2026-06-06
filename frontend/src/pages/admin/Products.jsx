import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createProduct,
  getProducts,
  updateProductStatus,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductForm from "../../components/products/ProductForm";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const initializePage = useCallback(async () => {
    try {
      setFetching(true);
      setError("");

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error(error);
      setError("Failed to load products and categories.");
      toast.error("Failed to load data");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    initializePage();
  }, [initializePage]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      const payload = {
        name: formData.name?.trim(),
        description: formData.description?.trim() || "",
        price: Number(formData.price),
        discountedPrice:
          formData.discountedPrice !== "" && formData.discountedPrice != null
            ? Number(formData.discountedPrice)
            : null,
        sku: formData.sku?.trim() ? formData.sku.trim() : null,
        stockQuantity: Number(formData.stockQuantity),
        status: formData.status || "ACTIVE",
        categoryId: Number(formData.categoryId),
        images: Array.isArray(formData.images)
          ? formData.images
              .filter((img) => img?.imageUrl?.trim())
              .map((img, index) => ({
                imageUrl: img.imageUrl.trim(),
                isPrimary: Boolean(img.isPrimary ?? index === 0),
                displayOrder:
                  img.displayOrder != null ? Number(img.displayOrder) : index,
              }))
          : [],
      };

      await createProduct(payload);
      toast.success("Product created successfully");
      await initializePage();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to create product"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatus = async (product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionText = nextStatus === "INACTIVE" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setStatusLoadingId(product.id);

      await updateProductStatus(product.id, nextStatus);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      toast.success("Product status updated");
    } catch (error) {
      console.error(error?.response?.data || error);
      toast.error(
        error?.response?.data?.message || "Failed to update product status"
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategoryId === "ALL" ||
        String(product.categoryId) === String(selectedCategoryId);

      const matchesStatus =
        selectedStatus === "ALL" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, selectedCategoryId, selectedStatus]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((product) => product.status === "ACTIVE").length,
      inactive: products.filter((product) => product.status === "INACTIVE").length,
      lowStock: products.filter((product) => Number(product.stockQuantity || 0) <= 5).length,
    };
  }, [products]);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const badgeClasses = (status) =>
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";

  if (fetching) {
    return (
      <section className="space-y-6">
        <div>
          <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-56 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Products
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Create products, review inventory, and manage active product status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Products" value={stats.total} tone="text-slate-900" />
        <StatCard title="Active" value={stats.active} tone="text-emerald-600" />
        <StatCard title="Inactive" value={stats.inactive} tone="text-rose-600" />
        <StatCard title="Low Stock" value={stats.lowStock} tone="text-amber-600" />
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            onClick={initializePage}
            className="inline-flex w-fit items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Create Product</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a new product with category, pricing, stock, and images.
        </p>

        <div className="mt-6">
          <ProductForm
            categories={categories}
            onSubmit={handleCreate}
            loading={formLoading}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search by name, category, or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
          />

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {!filteredProducts.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No products found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Try changing your filters or create a new product.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const isUpdatingStatus = statusLoadingId === product.id;
            const imageUrl =
              product.primaryImageUrl ||
              product.images?.find((img) => img.isPrimary)?.imageUrl ||
              product.images?.[0]?.imageUrl ||
              "https://placehold.co/600x400?text=No+Image";

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-60 w-full object-cover"
                  loading="lazy"
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.categoryName || "Uncategorized"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${badgeClasses(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {product.description || "No description provided."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Final Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(product.finalPrice ?? product.price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Stock
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {product.stockQuantity ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Base Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Discounted
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {product.discountedPrice != null
                          ? formatCurrency(product.discountedPrice)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStatus(product)}
                    disabled={isUpdatingStatus}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingStatus
                      ? "Updating..."
                      : product.status === "ACTIVE"
                      ? "Deactivate Product"
                      : "Activate Product"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatCard({ title, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}