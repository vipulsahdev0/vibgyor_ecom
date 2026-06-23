import { useEffect, useState } from "react";
import { Loader2, Tag, Image as ImageIcon, FileText } from "lucide-react";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const LABEL =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

const initialFormState = {
  name: "",
  description: "",
  imageUrl: "",
};

export default function CategoryForm({
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const isEdit = Boolean(initialData);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? initialData.categoryName ?? "",
        description: initialData.description ?? "",
        imageUrl: initialData.imageUrl ?? "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
    };

    if (!payload.name) return;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="category-name" className={LABEL}>
          Category Name *
        </label>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="category-name"
            type="text"
            name="name"
            required
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Electronics, Fashion"
            className={`${INPUT} pl-10`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="category-description" className={LABEL}>
          Description
        </label>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <textarea
            id="category-description"
            name="description"
            rows={4}
            maxLength={1000}
            value={formData.description}
            onChange={handleChange}
            placeholder="Short description about this category"
            className={`${INPUT} resize-none pl-10`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="category-image-url" className={LABEL}>
          Image URL
        </label>
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="category-image-url"
            type="url"
            name="imageUrl"
            maxLength={500}
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/category-image.jpg"
            className={`${INPUT} pl-10`}
          />
        </div>

        {formData.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={formData.imageUrl}
              alt={formData.name || "Category preview"}
              className="h-40 w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !formData.name.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isEdit ? (
          "Update Category"
        ) : (
          "Create Category"
        )}
      </button>
    </form>
  );
}