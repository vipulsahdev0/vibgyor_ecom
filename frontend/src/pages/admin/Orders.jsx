import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { getAllOrders } from "../../api/orderApi";
import {
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "../../api/adminApi";
import StatCard from "../../components/shared/StatCard";
import TableSkeleton from "../../components/shared/TableSkeleton";
import ErrorBanner from "../../components/shared/ErrorBanner";
import PageHeader from "../../components/shared/PageHeader";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const formatStatusLabel = (value) => String(value || "—").replaceAll("_", " ");

const ORDER_STATUS_STYLES = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  PACKED: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
  SHIPPED: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  REFUNDED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const PAYMENT_STATUS_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  REFUNDED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const ALL_ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const ALL_PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

const STATUS_FILTERS = [
  "ALL",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const normalizeOrderItem = (item, index) => ({
  id: item?.id ?? `${item?.productId ?? "item"}-${index}`,
  productName: item?.productName ?? "Unnamed item",
  quantity: Number(item?.quantity ?? 0),
  unitPrice: Number(item?.unitPrice ?? 0),
  lineTotal: Number(
    item?.lineTotal ?? Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0)
  ),
});

const normalizeOrder = (order) => ({
  ...order,
  id: order?.id,
  orderNumber: order?.orderNumber ?? "",
  createdAt: order?.createdAt ?? null,
  totalAmount: Number(order?.totalAmount ?? 0),
  orderStatus: order?.orderStatus ?? "PENDING_PAYMENT",
  paymentStatus: order?.paymentStatus ?? "PENDING",
  orderItems: Array.isArray(order?.orderItems)
    ? order.orderItems.map(normalizeOrderItem)
    : [],
  itemCount: Number(order?.itemCount ?? order?.orderItems?.length ?? 0),
});

function MobileOrderCard({
  order,
  onStatusChange,
  onPaymentStatusChange,
  updatingId,
}) {
  const [expanded, setExpanded] = useState(false);
  const isUpdating = updatingId === order.id;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {order.orderNumber || `#${order.id}`}
            </p>
            <p className="text-[11px] text-slate-400">{formatDate(order.createdAt)}</p>
          </div>
          <p className="text-sm font-black tabular-nums text-slate-900">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[order.orderStatus] ?? "bg-slate-100 text-slate-600"
              }`}
          >
            {formatStatusLabel(order.orderStatus)}
          </span>

          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ??
              "bg-slate-100 text-slate-600"
              }`}
          >
            {formatStatusLabel(order.paymentStatus)}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            <Package className="h-3 w-3" />
            {order.itemCount} items
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <select
            disabled={isUpdating}
            value={order.orderStatus}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            {ALL_ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>

          <select
            disabled={isUpdating}
            value={order.paymentStatus}
            onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            {ALL_PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>

          {isUpdating && (
            <Loader2 className="self-center h-4 w-4 animate-spin text-indigo-500" />
          )}
        </div>

        {order.orderItems.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            <span>Order items ({order.orderItems.length})</span>
            {isExpanded && order.orderItems?.length > 0 ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {expanded && order.orderItems.length > 0 && (
        <div className="divide-y divide-slate-50 border-t border-slate-100 bg-slate-50/50">
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {item.productName}
                </p>
                <p className="text-[11px] text-slate-400">
                  Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="text-xs font-bold tabular-nums text-slate-700">
                {formatCurrency(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");
      const response = await getAllOrders();
      const data =
        response?.data?.data ??
        response?.data ??
        response ??
        [];

      setOrders(Array.isArray(data) ? data.map(normalizeOrder) : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) =>
        ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"].includes(
          order.orderStatus
        )
      ).length,
      completed: orders.filter((order) => order.orderStatus === "DELIVERED").length,
      cancelled: orders.filter((order) => order.orderStatus === "CANCELLED").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "ALL" || order.orderStatus === statusFilter;

      const matchSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        String(order.id).includes(query) ||
        order.orderStatus.toLowerCase().includes(query) ||
        order.paymentStatus.toLowerCase().includes(query);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    try {
      await updateAdminOrderStatus(orderId, {
        orderStatus: newStatus,
        note: "",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);

    try {
      await updateAdminPaymentStatus(orderId, {
        paymentStatus: newPaymentStatus,
        reason: "",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus: newPaymentStatus }
            : order
        )
      );

      toast.success("Payment status updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-7 w-36 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <TableSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Monitor customer orders, payments, and fulfillment."
        onRefresh={() => fetchOrders(false)}
        refreshing={refreshing}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={orderStats.total} accent="slate" Icon={ClipboardList} />
        <StatCard title="Pending" value={orderStats.pending} accent="amber" Icon={Clock} />
        <StatCard title="Delivered" value={orderStats.completed} accent="emerald" Icon={CheckCircle2} />
        <StatCard title="Cancelled" value={orderStats.cancelled} accent="rose" Icon={XCircle} />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by order number or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              {formatStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> of{" "}
        <span className="font-bold text-slate-900">{orders.length}</span> orders
      </p>

      {!filteredOrders.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <ClipboardList className="h-8 w-8 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {search || statusFilter !== "ALL"
                ? "No orders match your filters"
                : "No orders yet"}
            </p>

            {(search || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Order",
                    "Date",
                    "Amount",
                    "Order Status",
                    "Payment Status",
                    "Items",
                    "Actions",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${index === 6 ? "text-right" : "text-left"
                        }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => {
                  const isUpdating = updatingId === order.id;
                  const isExpanded = expandedRow === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr className="group transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {order.orderNumber || `#${order.id}`}
                          </p>
                          <p className="text-[11px] text-slate-400">ID #{order.id}</p>
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold tabular-nums text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="px-4 py-4">
                          <select
                            disabled={isUpdating}
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                          >
                            {ALL_ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <select
                            disabled={isUpdating}
                            value={order.paymentStatus}
                            onChange={(e) =>
                              handlePaymentStatusChange(order.id, e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                          >
                            {ALL_PAYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                            <Package className="h-3 w-3" />
                            {order.itemCount}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUpdating && (
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            )}

                            {order.orderItems.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleRow(order.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                Items
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && order.orderItems.length > 0 && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="px-6 py-3">
                            <div className="space-y-1.5">
                              {order.orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5"
                                >
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">
                                      {item.productName}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                                    </p>
                                  </div>
                                  <p className="text-xs font-bold tabular-nums text-slate-700">
                                    {formatCurrency(item.lineTotal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredOrders.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentStatusChange={handlePaymentStatusChange}
                updatingId={updatingId}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}