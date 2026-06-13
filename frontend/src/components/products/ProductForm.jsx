import { useState } from "react";
import { Plus, X, ImageIcon, Loader2 } from "lucide-react";

const INPUT = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

export default function ProductForm({ categories = [], onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name:          "",
    description:   "",
    price:         "",
    discountedPrice: "",
    stockQuantity: "",
    sku:           "",
    categoryId:    "",
    status:        "ACTIVE",
    images:        [],
  });
  const [imageUrl,  setImageUrl]  = useState("");
  const [imgError,  setImgError]  = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) { setImgError("Enter an image URL"); return; }
    if (formData.images.some((img) => img.imageUrl === url)) {
      setImgError("Image already added"); return;
    }
    setImgError("");
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { imageUrl: url, isPrimary: prev.images.length === 0, displayOrder: prev.images.length },
      ],
    }));
    setImageUrl("");
  };

  const removeImage = (index) =>
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      // re-assign primary to first image if the primary was removed
      if (updated.length && prev.images[index]?.isPrimary) updated[0].isPrimary = true;
      return { ...prev, images: updated };
    });

  const setPrimary = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      name:           formData.name.trim(),
      description:    formData.description.trim(),
      sku:            formData.sku.trim() || undefined,
      price:          Number(formData.price),
      discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
      stockQuantity:  Number(formData.stockQuantity),
      categoryId:     Number(formData.categoryId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div>
        <label className={LABEL}>Product Name *</label>
        <input type="text" name="name" value={formData.name}
          onChange={handleChange} required placeholder="e.g. Premium Wireless Headphones"
          className={INPUT} />
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>Description</label>
        <textarea name="description" value={formData.description}
          onChange={handleChange} rows={3} placeholder="Product description…"
          className={INPUT + " resize-none"} />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Price (₹) *</label>
          <input type="number" name="price" value={formData.price}
            onChange={handleChange} required min="0" step="0.01"
            placeholder="0.00" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Discounted Price (₹)</label>
          <input type="number" name="discountedPrice" value={formData.discountedPrice}
            onChange={handleChange} min="0" step="0.01"
            placeholder="Optional" className={INPUT} />
        </div>
      </div>

      {/* Stock + SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Stock Quantity *</label>
          <input type="number" name="stockQuantity" value={formData.stockQuantity}
            onChange={handleChange} required min="0" placeholder="0" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>SKU</label>
          <input type="text" name="sku" value={formData.sku}
            onChange={handleChange} placeholder="Optional" className={INPUT} />
        </div>
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Category *</label>
          <select name="categoryId" value={formData.categoryId}
            onChange={handleChange} required className={INPUT}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name ?? c.categoryName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Status</label>
          <select name="status" value={formData.status}
            onChange={handleChange} className={INPUT}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Image URLs */}
      <div>
        <label className={LABEL}>Product Images</label>
        <div className="flex gap-2">
          <input type="text" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImgError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            placeholder="Paste image URL and click Add" className={INPUT + " flex-1"} />
          <button type="button" onClick={addImage}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {imgError && <p className="mt-1.5 text-xs text-rose-500">{imgError}</p>}

        {formData.images.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className={`flex items-center gap-3 rounded-xl border p-2.5 transition ${
                img.isPrimary ? "border-indigo-300 bg-indigo-50" : "border-slate-100 bg-slate-50"
              }`}>
                <img src={img.imageUrl} alt="Preview"
                  className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-600">{img.imageUrl}</p>
                  {img.isPrimary && (
                    <span className="mt-0.5 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!img.isPrimary && (
                    <button type="button" onClick={() => setPrimary(idx)}
                      className="rounded-lg border border-indigo-200 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 transition">
                      Set Primary
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {formData.images.length === 0 && (
          <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-6 text-slate-400">
            <ImageIcon className="h-6 w-6" />
            <p className="text-xs">No images added yet</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Create Product"}
      </button>
    </form>
  );
}