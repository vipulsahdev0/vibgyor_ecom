import { Link, useLocation, useParams, Navigate } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

const formatCurrency = (amount) =>
  amount == null
    ? "₹0.00"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const getBadgeClass = (s = "") => {
  const v = s.toUpperCase();
  if (["SUCCESS","PAID","COMPLETED"].includes(v)) return "bg-emerald-100 text-emerald-700";
  if (["PENDING","PROCESSING"].includes(v))        return "bg-amber-100 text-amber-700";
  if (["FAILED","CANCELLED"].includes(v))          return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const formatMethod = (m = "") =>
  m.replace(/_/g, " ").replace(/\w/g, (c) => c.toUpperCase());

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const location    = useLocation();

  const { orderNumber, paymentMethod, totalAmount, paymentStatus } = location.state || {};

  if (!orderId && !orderNumber) return <Navigate to="/account/orders" replace />;

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Success icon + heading */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Order Confirmed!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your order has been placed successfully. We&apos;ll keep you updated.
          </p>
        </div>

        {/* Order details card */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-50 bg-slate-50/60 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Package className="h-3.5 w-3.5" /> Order Details
            </div>
          </div>

          <dl className="divide-y divide-slate-50">
            {orderNumber && (
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-xs text-slate-400">Order Number</dt>
                <dd className="text-sm font-bold text-slate-900">#{orderNumber}</dd>
              </div>
            )}
            {paymentMethod && (
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-xs text-slate-400">Payment Method</dt>
                <dd className="text-sm font-medium text-slate-700">{formatMethod(paymentMethod)}</dd>
              </div>
            )}
            {totalAmount != null && (
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-xs text-slate-400">Total Amount</dt>
                <dd className="text-sm font-bold text-slate-900">{formatCurrency(totalAmount)}</dd>
              </div>
            )}
            {paymentStatus && (
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-xs text-slate-400">Payment Status</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass(paymentStatus)}`}>
                    {paymentStatus}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/account/orders"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
          >
            <Package className="h-4 w-4" /> View Orders
          </Link>
          <Link
            to="/products"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}