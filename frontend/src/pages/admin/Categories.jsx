import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Tag, Plus, Pencil, RefreshCw,
  Loader2, ToggleLeft, ToggleRight, PackageSearch, X, Search,
} from "lucide-react";
import {
  getCategories, createCategory, updateCategory, updateCategoryStatus,
} from "../../api/categoryApi";
import CategoryForm from "../../components/categories/CategoryForm";
import StatCard from "../../components/shared/StatCard";
import TableSkeleton from "../../components/shared/TableSkeleton";
import ErrorBanner from "../../components/shared/ErrorBanner";
import PageHeader from "../../components/shared/PageHeader";

// ─── Style maps aligned with backend Status enum (ACTIVE | INACTIVE) ─────────
const STATUS_STYLES = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
};

export default function AdminCategories() {
  const [categories,       setCategories]       = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [formLoading,      setFormLoading]      = useState(false);
  const [statusLoadingId,  setStatusLoadingId]  = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm,         setShowForm]         = useState(false);
  const [error,            setError]            = useState("");
  const [search,           setSearch]           = useState("");
  const [filterStatus,     setFilterStatus]     = useState("ALL");
  const [refreshing,       setRefreshing]       = useState(false);

  // ── Fetch — GET /api/categories ─────────────────────────────────────────
  const fetchCategories = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      setError("");
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
      toast.error("Failed to load categories");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const closeForm = () => { setSelectedCategory(null); setShowForm(false); };
  const openCreate = () => { setSelectedCategory(null); setShowForm(true); };
  const openEdit   = (cat) => { setSelectedCategory(cat); setShowForm(true); };

  // ── Create — POST /api/categories ───────────────────────────────────────
  const handleCreate = async (data) => {
    try {
      setFormLoading(true);
      await createCategory({
        name:        data.name?.trim(),
        description: data.description?.trim() || "",
        imageUrl:    data.imageUrl?.trim()    || "",
      });
      toast.success("Category created");
      await fetchCategories(true);
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create category");
    } finally { setFormLoading(false); }
  };

  // ── Update — PUT /api/categories/{id} ───────────────────────────────────
  const handleUpdate = async (data) => {
    if (!selectedCategory?.id) return;
    try {
      setFormLoading(true);
      await updateCategory(selectedCategory.id, {
        name:        data.name?.trim(),
        description: data.description?.trim() || "",
        imageUrl:    data.imageUrl?.trim()    || "",
      });
      toast.success("Category updated");
      await fetchCategories(true);
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update category");
    } finally { setFormLoading(false); }
  };

  // ── Toggle status — PATCH /api/categories/{id}/status ───────────────────
  const handleStatus = async (category) => {
    const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`${nextStatus === "INACTIVE" ? "Deactivate" : "Activate"} "${category.name}"?`)) return;
    try {
      setStatusLoadingId(category.id);
      await updateCategoryStatus(category.id, nextStatus);
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, status: nextStatus } : c));
      toast.success(`Category ${nextStatus === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update status");
    } finally { setStatusLoadingId(null); }
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalCategories = categories.length;
  const activeCount     = useMemo(() => categories.filter(c => c.status === "ACTIVE").length, [categories]);
  const inactiveCount   = totalCategories - activeCount;
  const totalLinked     = useMemo(() => categories.reduce((s, c) => s + Number(c.productCount || 0), 0), [categories]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => categories.filter(cat => {
    const matchSearch = !search ||
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || cat.status === filterStatus;
    return matchSearch && matchStatus;
  }), [categories, search, filterStatus]);

  if (loading) return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <TableSkeleton />
    </section>
  );

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage product categories and their visibility.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 self-start rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 sm:self-auto">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total"           value={totalCategories} accent="slate"   Icon={Tag}           />
        <StatCard title="Active"          value={activeCount}     accent="emerald" Icon={ToggleRight}   />
        <StatCard title="Inactive"        value={inactiveCount}   accent="rose"    Icon={ToggleLeft}    />
        <StatCard title="Products Linked" value={totalLinked}     accent="indigo"  Icon={PackageSearch} />
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} />}

      {/* Inline form panel */}
      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                {selectedCategory ? <Pencil className="h-3.5 w-3.5 text-indigo-600" /> : <Plus className="h-3.5 w-3.5 text-indigo-600" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedCategory ? `Edit "${selectedCategory.name}"` : "New Category"}
                </p>
                <p className="text-[11px] text-slate-400">Fill in the details below</p>
              </div>
            </div>
            <button onClick={closeForm}
              className="rounded-lg border border-slate-200 p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <CategoryForm
              initialData={selectedCategory}
              onSubmit={selectedCategory ? handleUpdate : handleCreate}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "ACTIVE", "INACTIVE"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                filterStatus === f
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {!filteredCategories.length && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <Tag className="h-8 w-8 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {search || filterStatus !== "ALL" ? "No categories match your filters" : "No categories yet"}
            </p>
            {search || filterStatus !== "ALL"
              ? <button onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                  className="mt-2 text-xs text-indigo-600 hover:underline">Clear filters</button>
              : <button onClick={openCreate}
                  className="mx-auto mt-3 flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-3.5 w-3.5" /> Add your first category
                </button>
            }
          </div>
        </div>
      )}

      {/* Desktop table */}
      {filteredCategories.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["Category", "Description", "Products", "Status", "Actions"].map((h, i) => (
                    <th key={h}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 4 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.map(category => {
                  const isStatusLoading = statusLoadingId === category.id;
                  // categoryApi.js normalises the field as categoryName
                  const displayName = category.categoryName ?? category.name;
                  return (
                    <tr key={category.id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {category.imageUrl
                            ? <img src={category.imageUrl} alt={displayName}
                                width={36} height={36} loading="lazy"
                                className="h-9 w-9 shrink-0 rounded-xl object-cover border border-slate-100" />
                            : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                                <Tag className="h-4 w-4 text-indigo-500" />
                              </div>
                          }
                          <div>
                            <p className="text-sm font-bold text-slate-900">{displayName}</p>
                            <p className="text-[11px] text-slate-400">ID #{category.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs px-5 py-4 text-xs text-slate-500">
                        <p className="line-clamp-2">{category.description || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                          <PackageSearch className="h-3 w-3" />{category.productCount ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[category.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(category)}
                            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 active:scale-95">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button disabled={isStatusLoading} onClick={() => handleStatus(category)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                              category.status === "ACTIVE"
                                ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}>
                            {isStatusLoading
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating</>
                              : category.status === "ACTIVE"
                                ? <><ToggleLeft className="h-3.5 w-3.5" /> Deactivate</>
                                : <><ToggleRight className="h-3.5 w-3.5" /> Activate</>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredCategories.map(category => {
              const isStatusLoading = statusLoadingId === category.id;
              const displayName = category.categoryName ?? category.name;
              return (
                <article key={category.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {category.imageUrl
                        ? <img src={category.imageUrl} alt={displayName}
                            width={40} height={40} loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-100" />
                        : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <Tag className="h-4 w-4 text-indigo-500" />
                          </div>
                      }
                      <div>
                        <p className="text-sm font-bold text-slate-900">{displayName}</p>
                        <p className="text-[11px] text-slate-400">ID #{category.id}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[category.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {category.status}
                    </span>
                  </div>

                  {category.description && (
                    <p className="mt-2.5 line-clamp-2 text-xs text-slate-500">{category.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                    <PackageSearch className="h-3.5 w-3.5" />
                    <span className="font-semibold text-indigo-700">{category.productCount ?? 0}</span> products linked
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openEdit(category)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button disabled={isStatusLoading} onClick={() => handleStatus(category)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-60 ${
                        category.status === "ACTIVE"
                          ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}>
                      {isStatusLoading
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Updating</>
                        : category.status === "ACTIVE"
                          ? <><ToggleLeft className="h-3.5 w-3.5" />Deactivate</>
                          : <><ToggleRight className="h-3.5 w-3.5" />Activate</>
                      }
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