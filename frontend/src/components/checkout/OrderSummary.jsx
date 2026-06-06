export default function OrderSummary({
  cart,
  onCheckout,
  loading,
  disabled = false,
}) {

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sticky top-24">

      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Order Summary
      </h2>

      <div className="space-y-3">

        {
          cart?.items?.map((item) => (

            <div
              key={item.cartItemId ?? item.productId}
              className="flex justify-between text-slate-700"
            >

              <div>

                <p className="font-medium">
                  {item.productName}
                </p>

                <p className="text-xs text-slate-500">
                  Qty: {item.quantity}
                </p>

              </div>

              <p className="font-semibold">
                ₹{Number(item.lineTotal ?? 0).toFixed(2)}
              </p>

            </div>
          ))
        }

      </div>

      <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">

        <span className="font-semibold text-slate-900">
          Total
        </span>

        <span className="text-2xl font-bold text-indigo-600">
          ₹{Number(cart?.grandTotal ?? 0).toFixed(2)}
        </span>

      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading || disabled}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >

        {
          loading
            ? "Processing..."
            : "Place Order"
        }

      </button>

    </div>
  );
}