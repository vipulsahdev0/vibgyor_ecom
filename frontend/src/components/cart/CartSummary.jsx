import { Link } from "react-router-dom";
import { ShoppingBag, Tag, Truck, Loader2, ArrowRight } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount ?? 0));

export default function CartSummary({
  subtotal  = 0,
  discount  = 0,
  total     = 0,
  totalItems = 0,
  onClear,
  clearing  = false,
}) {
  const hasDiscount = Number(discount) > 0;

  return (
    <aside className="sticky top-24 flex flex-col gap-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">{totalItems} item{totalItems !== 1 ? "s" : ""} in cart</p>
      </div>

      {/* Line items */}
      <div className="space-y-3 px-5 py-4">

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
        </div>

        {hasDiscount && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-slate-500">
              <Tag className="h-3.5 w-3.5" /> Discount
            </span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-slate-500">
            <Truck className="h-3.5 w-3.5" /> Delivery
          </span>
          <span className="font-semibold text-emerald-600">Free</span>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-lg font-black text-indigo-600 tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
          {hasDiscount && (
            <p className="mt-1 text-right text-[11px] font-medium text-emerald-600">
              You save {formatCurrency(discount)} on this order 🎉
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-slate-100 px-5 py-4">
        <Link
          to="/account/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95"
        >
          Proceed to Checkout <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onClear}
          disabled={clearing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {clearing
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Clearing…</>
            : "Clear Cart"
          }
        </button>
      </div>
    </aside>
  );
}