import { useEffect, useState } from "react";
import { Plus, X, ImageIcon, Loader2 } from "lucide-react";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const LABEL =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

const createInitialState = (initialData = {}) => ({
  name: initialData.name ?? "",
  description: initialData.description ?? "",
  price: initialData.price ?? "",
  discountedPrice: initialData.discountedPrice ?? "",
  stockQuantity: initialData.stockQuantity ?? "",
  sku: initialData.sku ?? "",
  categoryId: initialData.categoryId ?? "",
  status: initialData.status ?? "ACTIVE",
  images: Array.isArray(initialData.images) ? initialData.images : [],
});

export default function ProductForm({
  categories = [],
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Create Product",
}) {
  const [formData, setFormData] = useState(createInitialState(initialData));
  const [imageUrl, setImageUrl] = useState("");
  const [imgError, setImgError] = useState("");

  useEffect(() => {
    setFormData(createInitialState(initialData));
  }, [initialData]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) {
      setImgError("Enter an image URL");
      return;
    }
    if (formData.images.some((img) => img.imageUrl === url)) {
      setImgError("Image already added");
      return;
    }

    const nextOrder = formData.images.length + 1;

    setImgError("");
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          imageUrl: url,
          isPrimary: prev.images.length === 0,
          displayOrder: nextOrder,
        },
      ],
    }));
    setImageUrl("");
  };

  const removeImage = (index) =>
    setFormData((prev) => {
      const updated = prev.images
        .filter((_, i) => i !== index)
        .map((img, i) => ({
          ...img,
          isPrimary: img.isPrimary,
          displayOrder: i + 1,
        }));

      if (updated.length && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }

      return { ...prev, images: updated };
    });

  const setPrimary = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
        displayOrder: i + 1,
      })),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.discountedPrice &&
      Number(formData.discountedPrice) > Number(formData.price)
    ) {
      alert("Discounted price cannot be greater than price");
      return;
    }

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      sku: formData.sku.trim() || undefined,
      price: Number(formData.price),
      discountedPrice:
        formData.discountedPrice !== ""
          ? Number(formData.discountedPrice)
          : undefined,
      stockQuantity: Number(formData.stockQuantity),
      categoryId: Number(formData.categoryId),
      images: formData.images.map((img, index) => ({
        imageUrl: img.imageUrl,
        isPrimary: Boolean(img.isPrimary),
        displayOrder: index + 1,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* keep the rest of your same JSX */}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}