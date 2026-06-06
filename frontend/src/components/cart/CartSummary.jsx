import { Link } from "react-router-dom";

export default function CartSummary({
  subtotal = 0,
  discount = 0,
  total = 0,
  totalItems = 0,
  onClear,
  clearing = false,
}) {
  return (
    <aside className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-8 text-3xl font-black text-slate-900">
        Cart Summary
      </h2>

      <div className="space-y-5">
        <div className="flex justify-between text-slate-600">
          <span>Items</span>
          <span className="font-semibold">{totalItems}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold">₹{Number(subtotal).toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Discount</span>
            <span className="font-semibold text-emerald-600">
              -₹{Number(discount).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Delivery</span>
          <span className="font-semibold">Included</span>
        </div>

        <div className="flex justify-between border-t pt-5 text-2xl font-black text-slate-900">
          <span>Total</span>
          <span className="text-indigo-600">₹{Number(total).toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={clearing}
        className="mt-8 w-full rounded-2xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {clearing ? "Clearing..." : "Clear Cart"}
      </button>

      <Link
        to="/account/checkout"
        className="mt-4 block w-full rounded-2xl bg-indigo-600 py-3 text-center font-bold text-white transition hover:bg-indigo-700"
      >
        Proceed to Checkout
      </Link>
    </aside>
  );
}