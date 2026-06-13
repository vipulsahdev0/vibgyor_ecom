import { Loader2, ArrowRight, ShoppingBag, Tag, Truck } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount ?? 0));

export default function OrderSummary({ cart, onCheckout, loading, disabled = false }) {
  const items    = cart?.items    ?? [];
  const subtotal = Number(cart?.subtotal   ?? 0);
  const discount = Number(cart?.discountTotal ?? 0);
  const total    = Number(cart?.grandTotal  ?? 0);
  const hasDiscount = discount > 0;

  return (
    <aside className="sticky top-24 flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <ShoppingBag className="h-4 w-4 text-indigo-500" />
        <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
      </div>

      {/* Items list */}
      <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 px-5">
        {items.map((item) => (
          <div key={item.cartItemId ?? item.productId}
               className="flex items-center gap-3 py-3">
            {item.productImageUrl && (
              <img
                src={item.productImageUrl}
                alt={item.productName}
                width={40} height={40}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-100 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{item.productName}</p>
              <p className="text-[11px] text-slate-400">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 text-xs font-bold text-slate-700 tabular-nums">
              {formatCurrency(item.lineTotal ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2.5 border-t border-slate-100 px-5 py-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800 tabular-nums">{formatCurrency(subtotal)}</span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between text-slate-500">
            <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Discount</span>
            <span className="font-semibold text-emerald-600 tabular-nums">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-500">
          <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery</span>
          <span className="font-semibold text-emerald-600">Free</span>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-lg font-black text-indigo-600 tabular-nums">{formatCurrency(total)}</span>
        </div>

        {hasDiscount && (
          <p className="text-right text-[11px] font-medium text-emerald-600">
            You save {formatCurrency(discount)} on this order 🎉
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            : <>Place Order <ArrowRight className="h-4 w-4" /></>
          }
        </button>
        <p className="mt-2.5 text-center text-[11px] text-slate-400">
          By placing your order, you agree to our terms of service.
        </p>
      </div>
    </aside>
  );
}