import React from "react";

const STATUS_STYLES = {
  PENDING_PAYMENT: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}