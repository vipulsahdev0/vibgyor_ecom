import { Link, useLocation, useParams, Navigate } from "react-router-dom";

export default function PaymentSuccess() {
  const location = useLocation();
  const { orderId } = useParams();

  const orderNumber = location.state?.orderNumber;
  const paymentMethod = location.state?.paymentMethod;
  const totalAmount = location.state?.totalAmount;
  const paymentStatus = location.state?.paymentStatus;

  if (!orderId && !orderNumber) {
    return <Navigate to="/account/orders" replace />;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-12 text-center shadow-xl">
        <div className="text-7xl" aria-hidden="true">🎉</div>

        <h1 className="mt-6 text-4xl font-bold text-slate-900 sm:text-5xl">
          Order Successful
        </h1>

        <p className="mt-5 text-lg text-slate-500">
          Your order has been placed successfully.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
          {orderNumber ? (
            <>
              <p className="text-sm text-slate-500">Order Number</p>
              <p className="text-lg font-semibold text-slate-900">{orderNumber}</p>
            </>
          ) : null}

          {paymentMethod ? (
            <>
              <p className="mt-4 text-sm text-slate-500">Payment Method</p>
              <p className="text-base font-medium text-slate-900">{paymentMethod}</p>
            </>
          ) : null}

          {typeof totalAmount !== "undefined" ? (
            <>
              <p className="mt-4 text-sm text-slate-500">Total Amount</p>
              <p className="text-base font-medium text-slate-900">
                ₹{Number(totalAmount).toFixed(2)}
              </p>
            </>
          ) : null}

          {paymentStatus ? (
            <>
              <p className="mt-4 text-sm text-slate-500">Payment Status</p>
              <p className="text-base font-medium text-slate-900">{paymentStatus}</p>
            </>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/account/orders"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
          >
            View Orders
          </Link>

          <Link
            to="/products"
            className="rounded-xl bg-slate-200 px-6 py-3 text-slate-800 transition hover:bg-slate-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}