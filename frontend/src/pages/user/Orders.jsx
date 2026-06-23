import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getUserOrders,
  cancelOrder,

} from "../../api/orderApi";
import OrderCard from "../../components/orders/OrderCard";
import OrderSearch from "../../components/orders/OrderSearch";

import toast from "react-hot-toast";
const formatCurrency = (amount) =>
  amount == null
    ? "₹0.00"
    : new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
    : "-";


const STATUS_STYLES = {
  DELIVERED: "bg-emerald-100 text-emerald-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-blue-100 text-blue-700",
};

const getBadgeClass = (s = "") =>
  STATUS_STYLES[s.toUpperCase()] ?? "bg-slate-100 text-slate-600";

function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm animate-pulse"
        >
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-slate-100" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-20 rounded bg-slate-100" />
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-48 rounded bg-slate-100" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.userId) {
        setOrders([]);
        setError("User not found. Please login again.");
        return;
      }

      const data = await getUserOrders(user.userId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const [search, setSearch] = useState("");

const filteredOrders =
  orders.filter((order) =>
    order.orderNumber
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);

      toast.success("Order cancelled");

      fetchOrders();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Unable to cancel order"
      );
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your recent purchases and order progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchOrders}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <Link
            to="/products"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {loading && <OrderSkeleton />}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              No orders yet
            </h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              You haven&apos;t placed any orders yet. Start exploring products and
              place your first order.
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {/* {orders.map((order) => {
            const orderId = order.id;

            return (
              <article
                key={orderId}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {order.itemCount} items
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Order
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      #{order.orderNumber || order.id}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap justify-end gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus || "UNKNOWN"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-sm text-slate-600">
                    {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">

                  {["PENDING_PAYMENT", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.orderStatus) && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Cancel Order
                    </button>
                  )}

                  <Link
                    to={`/account/orders/${order.id}`}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                </div>
              </article>
            );
          })} */}
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}