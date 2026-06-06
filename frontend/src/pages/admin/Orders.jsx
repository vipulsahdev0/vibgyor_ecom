import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAllOrders } from "../../api/orderApi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((order) => order.orderStatus === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.orderStatus === "PENDING").length,
      completed: orders.filter((order) => order.orderStatus === "COMPLETED").length,
      cancelled: orders.filter((order) => order.orderStatus === "CANCELLED").length,
    };
  }, [orders]);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const orderStatusClasses = (status) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "PENDING":
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 ring-rose-200";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  };

  const paymentStatusClasses = (status) => {
    switch (status) {
      case "PAID":
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 ring-rose-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-64 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Orders
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Monitor customer orders, payment state, and fulfillment progress.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={orderStats.total} tone="text-slate-900" />
        <StatCard title="Pending" value={orderStats.pending} tone="text-amber-600" />
        <StatCard title="Completed" value={orderStats.completed} tone="text-emerald-600" />
        <StatCard title="Cancelled" value={orderStats.cancelled} tone="text-rose-600" />
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchOrders(false)}
            className="inline-flex w-fit items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!filteredOrders.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No orders found</h2>
          <p className="mt-2 text-sm text-slate-500">
            There are no orders available for the selected filter.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {order.orderNumber || `#${order.id}`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            ID: {order.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {order.itemCount ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${orderStatusClasses(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${paymentStatusClasses(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {order.orderNumber || `#${order.id}`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Order ID: {order.id}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Order Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${orderStatusClasses(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Payment Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${paymentStatusClasses(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Items
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {order.itemCount ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({ title, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}