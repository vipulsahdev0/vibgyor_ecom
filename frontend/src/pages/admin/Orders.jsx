import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList, RefreshCw, AlertCircle, Search,
  Clock, CheckCircle2, XCircle, Loader2, Filter,
  ChevronDown, ChevronUp, Package, IndianRupee,
} from "lucide-react";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../api/orderApi";
// ── helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v || 0));

const formatDate = (v) => v
  ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const ORDER_STATUS_STYLES = {
  PENDING:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",

  CONFIRMED:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",

  PROCESSING:
    "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",

  PACKED:
    "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",

  SHIPPED:
    "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",

  DELIVERED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",

  CANCELLED:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
};

const PAYMENT_STATUS_STYLES = {
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  FAILED: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  PENDING: "bg-amber-50   text-amber-700   ring-1 ring-inset ring-amber-200",
};

const ORDER_STATUS_ICON = {
  PENDING: <Clock className="h-3.5 w-3.5" />,
  CONFIRMED: <CheckCircle2 className="h-3.5 w-3.5" />,
  PROCESSING: <Clock className="h-3.5 w-3.5" />,
  PACKED: <Package className="h-3.5 w-3.5" />,
  SHIPPED: <Package className="h-3.5 w-3.5" />,
  DELIVERED: <CheckCircle2 className="h-3.5 w-3.5" />,
  CANCELLED: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_FILTERS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// ── sub-components ────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-100" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-16 rounded-full bg-slate-100" />
            <div className="h-5 w-16 rounded-full bg-slate-100" />
            <div className="h-5 w-16 rounded-full bg-slate-100" />
            <div className="h-5 w-20 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, accent, Icon }) {
  const map = {
    slate: { bg: "bg-slate-50", icon: "text-slate-500", val: "text-slate-900" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", val: "text-amber-700" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", val: "text-emerald-700" },
    rose: { bg: "bg-rose-50", icon: "text-rose-500", val: "text-rose-700" },
  };
  const c = map[accent] ?? map.slate;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 text-2xl font-black tabular-nums ${c.val}`}>{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-4.5 w-4.5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}

// Expandable row for order items on mobile
function MobileOrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
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
            {ORDER_STATUS_ICON[order.orderStatus]}{order.orderStatus}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "bg-slate-100 text-slate-600"}`}>
            {order.paymentStatus}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            <Package className="h-3 w-3" />{order.itemCount ?? 0} items
          </span>
        </div>

        {order.items?.length > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100">
            <span>Order items</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {expanded && order.items?.length > 0 && (
        <div className="divide-y divide-slate-50 border-t border-slate-100 bg-slate-50/50">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.productName}</p>
                <p className="text-[11px] text-slate-400">Qty {item.quantity}</p>
              </div>
              <p className="text-xs font-bold text-slate-700 tabular-nums">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true); else setRefreshing(true);
      setError("");
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(true); }, [fetchOrders]);

  const orderStats = useMemo(() => ({
    total: orders.length,

    pending: orders.filter(
      o => ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"]
        .includes(o.orderStatus)
    ).length,

    completed: orders.filter(
      o => o.orderStatus === "DELIVERED"
    ).length,

    cancelled: orders.filter(
      o => o.orderStatus === "CANCELLED"
    ).length,

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

  const handleStatusChange = async (orderId, status) => {
    try {

      await updateOrderStatus(orderId, {
        orderStatus: status,
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, orderStatus: status }
            : order
        )
      );

      toast.success("Order status updated");

    } catch (err) {

      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        "Failed to update order status"
      );
    }
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
        <StatCard title="Completed" value={orderStats.completed} accent="emerald" Icon={CheckCircle2} />
        <StatCard title="Cancelled" value={orderStats.cancelled} accent="rose" Icon={XCircle} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button onClick={() => fetchOrders(false)}
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
            Retry
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by order number or ID…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${statusFilter === f
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}>{f}</button>
          ))}
        </div>
      </div>

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
                  {["Order", "Items", "Total", "Order Status", "Payment", "Date"].map((h, i) => (
                    <th key={h}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map(order => (
                  <Fragment key={order.id}>
                    <tr key={order.id}
                      className={`group transition-colors hover:bg-slate-50/70 ${expandedRow === order.id ? "bg-indigo-50/30" : ""}`}>
                      <td className="px-5 py-4">
                        <button onClick={() => order.items?.length && toggleRow(order.id)}
                          className="flex items-center gap-1.5 text-left">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{order.orderNumber || `#${order.id}`}</p>
                            <p className="text-[11px] text-slate-400">ID {order.id}</p>
                          </div>
                          {order.items?.length > 0 && (
                            expandedRow === order.id
                              ? <ChevronUp className="h-3.5 w-3.5 text-indigo-500" />
                              : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                          <Package className="h-3 w-3" />{order.itemCount ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-slate-900 tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        {editingOrder === order.id ? (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => {
                              handleStatusChange(order.id, e.target.value);
                              setEditingOrder(null);
                            }}
                            autoFocus
                            className="rounded-lg border px-2 py-1 text-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="PACKED">Packed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => {
                              if (
                                order.orderStatus !== "DELIVERED" &&
                                order.orderStatus !== "CANCELLED"
                              ) {
                                setEditingOrder(order.id);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_STYLES[order.orderStatus] ??
                              "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {ORDER_STATUS_ICON[order.orderStatus]}
                            {order.orderStatus}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? "bg-slate-100 text-slate-600"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">{formatDate(order.createdAt)}</td>
                    </tr>

                    {/* Expandable items row */}
                    {expandedRow === order.id && order.items?.length > 0 && (
                      <tr key={`${order.id}-items`}>
                        <td colSpan={6} className="bg-indigo-50/20 px-5 py-3">
                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl border border-indigo-100 bg-white px-3.5 py-2.5">
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">{item.productName}</p>
                                  <p className="text-[11px] text-slate-400">Qty {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                </div>
                                <p className="text-xs font-bold text-indigo-700 tabular-nums">{formatCurrency(item.lineTotal)}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredOrders.map(order => (
              <MobileOrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}