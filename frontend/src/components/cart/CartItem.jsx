import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount ?? 0));

export default function CartItem({ item, onRemove, onUpdate, loading = false }) {
  const imageSrc  = item.productImageUrl || item.images?.[0]?.imageUrl || "https://placehold.co/300x300?text=Product";
  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
  const lineTotal = Number(item.lineTotal ?? unitPrice * item.quantity ?? 0);

  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:gap-5">

      {/* Image */}
      <Link to={`/products/${item.productId}`} className="shrink-0 self-start">
        <img
          src={imageSrc}
          alt={item.productName || "Product"}
          width={300} height={300}
          loading="lazy"
          className="h-24 w-24 rounded-xl border border-slate-100 object-cover transition sm:h-28 sm:w-28"
        />
      </Link>

      {/* Middle — name + controls */}
      <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
        <div>
          <Link
            to={`/products/${item.productId}`}
            className="line-clamp-1 text-sm font-bold text-slate-900 transition hover:text-indigo-600"
          >
            {item.productName || "Product"}
          </Link>
          {item.categoryName && (
            <p className="mt-0.5 text-xs text-indigo-500 font-medium">{item.categoryName}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">{formatCurrency(unitPrice)} each</p>
        </div>

        {/* Qty controls + remove */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stepper */}
          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => onUpdate(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.productName}`}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-[36px] text-center text-sm font-bold text-slate-900 tabular-nums">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={loading}
              aria-label={`Increase quantity of ${item.productName}`}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            disabled={loading}
            aria-label={`Remove ${item.productName} from cart`}
            className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex items-center justify-end sm:flex-col sm:items-end sm:justify-between shrink-0">
        <p className="text-base font-black text-indigo-600 tabular-nums">
          {formatCurrency(lineTotal)}
        </p>
      </div>
    </article>
  );
}