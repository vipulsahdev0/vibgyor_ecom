import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} from "../../api/categoryApi";
import CategoryForm from "../../components/categories/CategoryForm";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const totalCategories = useMemo(() => categories.length, [categories]);
  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === "ACTIVE").length,
    [categories]
  );

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError("Failed to load categories.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const closeForm = () => {
    setSelectedCategory(null);
    setShowForm(false);
  };

  const handleCreate = async (data) => {
    try {
      setFormLoading(true);

      await createCategory({
        name: data.name?.trim(),
        description: data.description?.trim() || "",
        imageUrl: data.imageUrl?.trim() || "",
      });

      toast.success("Category created successfully");
      await fetchCategories();
      closeForm();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to create category"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedCategory?.id) return;

    try {
      setFormLoading(true);

      await updateCategory(selectedCategory.id, {
        name: data.name?.trim(),
        description: data.description?.trim() || "",
        imageUrl: data.imageUrl?.trim() || "",
      });

      toast.success("Category updated successfully");
      await fetchCategories();
      closeForm();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update category"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatus = async (category) => {
    const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionText = nextStatus === "INACTIVE" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setStatusLoadingId(category.id);

      await updateCategoryStatus(category.id, nextStatus);

      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      toast.success("Category status updated");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update status"
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  const badgeClasses = (status) =>
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

  if (loading) {
    return (
      <section className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-9 w-44 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-5 w-72 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
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
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage product categories, update their details, and control active status.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowForm(true);
          }}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          Add Category
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Categories</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalCategories}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Categories</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCategories}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Inactive Categories</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">
            {totalCategories - activeCategories}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Products Linked</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {categories.reduce(
              (sum, category) => sum + Number(category.productCount || 0),
              0
            )}
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            onClick={fetchCategories}
            className="inline-flex w-fit items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedCategory ? "Edit Category" : "Create Category"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add or update category details for your catalog.
              </p>
            </div>

            <button
              onClick={closeForm}
              className="inline-flex w-fit items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          <CategoryForm
            initialData={selectedCategory}
            onSubmit={selectedCategory ? handleUpdate : handleCreate}
            loading={formLoading}
          />
        </div>
      )}

      {!categories.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No categories found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your first category to start organizing products.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowForm(true);
            }}
            className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create Category
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => {
                    const isStatusLoading = statusLoadingId === category.id;

                    return (
                      <tr key={category.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {category.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              ID: {category.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          <p className="max-w-md line-clamp-2">
                            {category.description || "No description provided."}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {category.productCount ?? 0}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClasses(
                              category.status
                            )}`}
                          >
                            {category.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowForm(true);
                              }}
                              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              disabled={isStatusLoading}
                              onClick={() => handleStatus(category)}
                              className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isStatusLoading
                                ? "Updating..."
                                : category.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {categories.map((category) => {
              const isStatusLoading = statusLoadingId === category.id;

              return (
                <article
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {category.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Category ID: {category.id}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClasses(
                        category.status
                      )}`}
                    >
                      {category.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {category.description || "No description provided."}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Linked Products
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {category.productCount ?? 0}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      disabled={isStatusLoading}
                      onClick={() => handleStatus(category)}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isStatusLoading
                        ? "Updating..."
                        : category.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
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