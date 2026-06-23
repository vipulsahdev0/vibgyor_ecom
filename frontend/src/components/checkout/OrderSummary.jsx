import {
  Loader2,
  ArrowRight,
  ShoppingBag,
  Tag,
  Truck,
  Clock3,
  ShieldCheck,
  Package,
} from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount ?? 0));

export default function OrderSummary({
  cart,
  onCheckout,
  loading,
  disabled = false,
}) {
  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const discount = Number(cart?.discountTotal ?? 0);
  const total = Number(cart?.grandTotal ?? 0);
  const hasDiscount = discount > 0;

  return (
    <aside className="sticky top-24 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {items.length} {items.length === 1 ? "item" : "items"} ready for checkout
        </p>
      </div>

      <div className="max-h-56 divide-y divide-slate-50 overflow-y-auto px-5">
        {items.map((item) => (
          <div
            key={item.cartItemId ?? item.productId}
            className="flex items-center gap-3 py-3"
          >
            {item.productImageUrl ? (
              <img
                src={item.productImageUrl}
                alt={item.productName}
                width={40}
                height={40}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Package className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {item.productName || "Product"}
              </p>
              <p className="text-[11px] text-slate-400">Qty {item.quantity ?? 0}</p>
            </div>

            <p className="shrink-0 text-xs font-bold tabular-nums text-slate-700">
              {formatCurrency(item.lineTotal ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-100 px-5 py-4 text-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span>Subtotal</span>
          <span className="font-semibold tabular-nums text-slate-800">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {hasDiscount && (
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Discount
            </span>
            <span className="font-semibold tabular-nums text-emerald-600">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-500">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            Delivery
          </span>
          <span className="font-semibold text-emerald-600">Free</span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            Estimated delivery
          </span>
          <span className="text-xs font-medium text-slate-700">Tomorrow - 3 days</span>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-lg font-black tabular-nums text-indigo-600">
            {formatCurrency(total)}
          </span>
        </div>

        {hasDiscount && (
          <p className="text-right text-[11px] font-medium text-emerald-600">
            You save {formatCurrency(discount)} on this order
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Secure checkout and safe payments
        </p>

        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Order
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-2.5 text-center text-[11px] text-slate-400">
          By placing your order, you agree to our terms of service.
        </p>
      </div>
    </aside>
  );
}