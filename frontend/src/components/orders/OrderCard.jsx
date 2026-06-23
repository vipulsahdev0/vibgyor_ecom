import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN");

export default function OrderCard({
  order,
  onCancel,
}) {
  const canCancel = [
    "PENDING_PAYMENT",
    "PENDING",
    "CONFIRMED",
  ].includes(order.orderStatus);

  return (
    <article className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold">
              #{order.orderNumber}
            </h3>

            <p className="text-xs text-slate-500">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold">
              {formatCurrency(
                order.totalAmount
              )}
            </p>

            <div className="mt-2 flex gap-2 justify-end">
              <OrderStatusBadge
                status={order.orderStatus}
              />

              <PaymentStatusBadge
                status={order.paymentStatus}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {order.itemCount} items
          </span>

          <div className="flex gap-2">
            {canCancel && (
              <button
                onClick={() =>
                  onCancel(order.id)
                }
                className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                Cancel
              </button>
            )}

            <Link
              to={`/account/orders/${order.id}`}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs"
            >
              Details
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}