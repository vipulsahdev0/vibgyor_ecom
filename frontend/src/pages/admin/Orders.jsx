import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList, RefreshCw, Search,
  Clock, CheckCircle2, XCircle, Loader2, Filter,
  ChevronDown, ChevronUp, Package, IndianRupee, CreditCard,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import { updateAdminOrderStatus, updateAdminPaymentStatus } from "../../api/adminApi";
import StatCard from "../../components/shared/StatCard";
import TableSkeleton from "../../components/shared/TableSkeleton";
import ErrorBanner from "../../components/shared/ErrorBanner";
import SearchBar from "../../components/shared/SearchBar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v || 0));

const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Status maps ──────────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CONFIRMED: "bg-blue-50  text-blue-700  ring-1 ring-inset ring-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  PACKED: "bg-cyan-50  text-cyan-700  ring-1 ring-inset ring-cyan-200",
  SHIPPED: "bg-sky-50   text-sky-700   ring-1 ring-inset ring-sky-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  CANCELLED: "bg-rose-50  text-rose-700  ring-1 ring-inset ring-rose-200",
  REFUNDED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const PAYMENT_STATUS_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  FAILED: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  PENDING: "bg-amber-50   text-amber-700   ring-1 ring-inset ring-amber-200",
  REFUNDED: "bg-slate-100  text-slate-600   ring-1 ring-inset ring-slate-200",
};

// All OrderStatus enum values from backend
const ALL_ORDER_STATUSES = [
  "PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED",
  "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

// All PaymentStatus enum values from backend
const ALL_PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

const STATUS_FILTERS = ["ALL", "PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// ─── Mobile card sub-component ────────────────────────────────────────────────
function MobileOrderCard({ order, onStatusChange, onPaymentStatusChange, updatingId }) {
  const [expanded, setExpanded] = useState(false);
  const isUpdating = updatingId === order.id;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{order.orderNumber || `#${order.id}`}</p>
            <p className="text-[11px] text-slate-400">{formatDate(order.createdAt)}</p>
          </div>
          <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(order.totalAmount)}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[order.orderStatus] ?? "bg-slate-100 text-slate-600"}`}>
            {order.orderStatus}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "bg-slate-100 text-slate-600"}`}>
            {order.paymentStatus}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            <Package className="h-3 w-3" />{order.itemCount ?? order.orderItems?.length ?? 0} items
          </span>
        </div>

        {/* Status update dropdowns */}
        <div className="mt-3 flex gap-2">
          <select
            disabled={isUpdating}
            value={order.orderStatus}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            disabled={isUpdating}
            value={order.paymentStatus}
            onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            {ALL_PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin self-center text-indigo-500" />}
        </div>

        {/* Items toggle */}
        {order.orderItems?.length > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100">
            <span>Order items ({order.orderItems.length})</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {expanded && order.orderItems?.length > 0 && (
        <div className="divide-y divide-slate-50 border-t border-slate-100 bg-slate-50/50">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.productName}</p>
                <p className="text-[11px] text-slate-400">Qty {item.quantity} × {formatCurrency(item.unitPrice)}</p>
              </div>
              <p className="text-xs font-bold text-slate-700 tabular-nums">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch all orders — GET /api/admin/orders ────────────────────────────
  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true); else setRefreshing(true);
      setError("");
      const res = await getAllOrders();
      // getAllOrders hits /api/admin/orders → ApiResponse<List<OrderResponse>>
      const data = res?.data ?? res;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders.");
      toast.error("Failed to load orders");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(true); }, [fetchOrders]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"].includes(o.orderStatus)).length,
    completed: orders.filter(o => o.orderStatus === "DELIVERED").length,
    cancelled: orders.filter(o => o.orderStatus === "CANCELLED").length,
  }), [orders]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchStatus = statusFilter === "ALL" || o.orderStatus === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      o.orderStatus?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [orders, statusFilter, search]);

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  // ── Update order status — PATCH /api/admin/orders/{orderId}/status ───────
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateAdminOrderStatus(orderId, {
        orderStatus: newStatus,
        note: "",
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update order status");
    } finally { setUpdatingId(null); }
  };

  // ── Update payment status — PATCH /api/admin/orders/{orderId}/payment-status
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);
    try {
      await updateAdminPaymentStatus(orderId, {
        paymentStatus: newPaymentStatus,
        reason: "",
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
      toast.success("Payment status updated");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update payment status");
    } finally { setUpdatingId(null); }
  };

  if (loading) return (
    <section className="space-y-6">
      <div className="h-7 w-36 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <TableSkeleton />
    </section>
  );

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor customer orders, payments, and fulfillment.</p>
        </div>
        <button onClick={() => fetchOrders(false)} disabled={refreshing}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={orderStats.total} accent="slate" Icon={ClipboardList} />
        <StatCard title="Pending" value={orderStats.pending} accent="amber" Icon={Clock} />
        <StatCard title="Delivered" value={orderStats.completed} accent="emerald" Icon={CheckCircle2} />
        <StatCard title="Cancelled" value={orderStats.cancelled} accent="rose" Icon={XCircle} />
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} />}

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by order number or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${statusFilter === f
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}>{f.replace("_", " ")}</button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> of{" "}
        <span className="font-bold text-slate-900">{orders.length}</span> orders
      </p>

      {/* Empty */}
      {!filteredOrders.length && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <ClipboardList className="h-8 w-8 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {search || statusFilter !== "ALL" ? "No orders match your filters" : "No orders yet"}
            </p>
            {(search || statusFilter !== "ALL") && (
              <button onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                className="mt-2 text-xs text-indigo-600 hover:underline">Clear filters</button>
            )}
          </div>
        </div>
      )}

      {/* Desktop table */}
      {filteredOrders.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["Order", "Date", "Amount", "Order Status", "Payment Status", "Items", "Actions"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 6 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map(order => {
                  const isUpdating = updatingId === order.id;
                  const isExpanded = expandedRow === order.id;
                  return (
                    <Fragment key={order.id}>
                      <tr className="group transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{order.orderNumber || `#${order.id}`}</p>
                          <p className="text-[11px] text-slate-400">ID #{order.id}</p>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-900 tabular-nums">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        {/* Order status dropdown */}
                        <td className="px-4 py-4">
                          <select
                            disabled={isUpdating}
                            value={order.orderStatus}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 ${ORDER_STATUS_STYLES[order.orderStatus] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}
                          >
                            {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                          </select>
                        </td>
                        {/* Payment status dropdown */}
                        <td className="px-4 py-4">
                          <select
                            disabled={isUpdating}
                            value={order.paymentStatus}
                            onChange={e => handlePaymentStatusChange(order.id, e.target.value)}
                            className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}
                          >
                            {ALL_PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                            <Package className="h-3 w-3" />
                            {order.itemCount ?? order.orderItems?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
                            {order.orderItems?.length > 0 && (
                              <button onClick={() => toggleRow(order.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                Items
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable items row */}
                      {isExpanded && order.orderItems?.length > 0 && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="px-6 py-3">
                            <div className="space-y-1.5">
                              {order.orderItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">{item.productName}</p>
                                    <p className="text-[11px] text-slate-400">Qty {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 tabular-nums">{formatCurrency(item.lineTotal)}</p>
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

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredOrders.map(order => (
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