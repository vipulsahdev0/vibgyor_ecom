import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  onRemove,
  onUpdate,
  loading = false,
}) {
  const imageSrc =
    item.productImageUrl || "https://placehold.co/300x300?text=Product";

  const unitPrice = Number(item.unitPrice ?? 0);
  const lineTotal = Number(item.lineTotal ?? 0);

  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:flex-row">
      <img
        src={imageSrc}
        alt={item.productName}
        className="h-40 w-full rounded-2xl object-cover lg:w-40"
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {item.productName}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Added to your cart for checkout.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => onUpdate(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              className="px-4 py-3 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Decrease quantity of ${item.productName}`}
              title="Decrease quantity"
            >
              <Minus size={18} />
            </button>

            <div className="min-w-[56px] px-5 text-center font-bold text-slate-900">
              {item.quantity}
            </div>

            <button
              type="button"
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={loading}
              className="px-4 py-3 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Increase quantity of ${item.productName}`}
              title="Increase quantity"
            >
              <Plus size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={loading}
            className="flex items-center gap-2 font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Remove ${item.productName} from cart`}
          >
            <Trash2 size={18} />
            Remove
          </button>
        </div>
      </div>

      <div className="flex min-w-[120px] flex-col justify-between lg:items-end">
        <div className="text-sm text-slate-500">
          ₹{unitPrice.toFixed(2)} each
        </div>

        <div className="text-3xl font-black text-indigo-600">
          ₹{lineTotal.toFixed(2)}
        </div>
      </div>
    </article>
  );
}