import { useEffect, useState } from "react";
import { Loader2, Tag } from "lucide-react";

const INPUT = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

const STATUS_OPTIONS = [
  { value: "ACTIVE",   label: "Active",   dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Inactive", dot: "bg-slate-400"   },
];

export default function CategoryForm({ onSubmit, initialData = null, loading = false }) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({ name: "", description: "", status: "ACTIVE" });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name:        initialData.categoryName || initialData.name || "",
        description: initialData.description  || "",
        status:      initialData.status       || "ACTIVE",
      });
    } else {
      setFormData({ name: "", description: "", status: "ACTIVE" });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, name: formData.name.trim(), description: formData.description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div>
        <label className={LABEL}>Category Name *</label>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Electronics, Fashion…"
            className={INPUT + " pl-10"}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Short description about this category…"
          className={INPUT + " resize-none"}
        />
      </div>

      {/* Status */}
      <div>
        <label className={LABEL}>Status</label>
        <div className="flex gap-3">
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value}
              className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                formData.status === opt.value
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}>
              <input type="radio" name="status" value={opt.value}
                checked={formData.status === opt.value}
                onChange={handleChange} className="sr-only" />
              <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          : isEdit ? "Update Category" : "Create Category"
        }
      </button>
    </form>
  );
}