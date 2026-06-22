import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users, Package, Tag, ClipboardList,
  TrendingUp, RefreshCw,
  BarChart3, ShoppingCart, CheckCircle2, XCircle, Clock,
  CreditCard, AlertTriangle,
} from "lucide-react";
import { getDashboardSummary } from "../../api/dashboardApi";
import StatCard from "../../components/shared/StatCard";
import ErrorBanner from "../../components/shared/ErrorBanner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v || 0));

const formatNum = (v) => new Intl.NumberFormat("en-IN").format(Number(v || 0));

// ─── Initial state aligned with DashboardSummaryResponse DTO ─────────────────
const initialDashboard = {
  // AdminCountsResponse
  counts: { userCount: 0, productCount: 0, categoryCount: 0, orderCount: 0 },
  // SalesStatsResponse — now includes successPayments, failedPayments, pendingPayments
  salesStats: {
    totalSales: 0,
    averageOrderValue: 0,
    paidOrderCount: 0,
    totalPaymentCount: 0,
    successPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
  },
  // OrderStatsResponse
  orderStats: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0 },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${accent ?? "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function OrderStatusBar({ pending, completed, cancelled, total }) {
  if (!total) return <p className="py-4 text-center text-xs text-slate-400">No orders yet</p>;

  const pct = (n) => Math.round((n / total) * 100);

  const bars = [
    { label: "Completed", count: completed, pct: pct(completed), color: "bg-emerald-500", Icon: CheckCircle2, text: "text-emerald-700" },
    { label: "Pending", count: pending, pct: pct(pending), color: "bg-amber-400", Icon: Clock, text: "text-amber-700" },
    { label: "Cancelled", count: cancelled, pct: pct(cancelled), color: "bg-rose-400", Icon: XCircle, text: "text-rose-700" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full">
        {bars.map(b => b.pct > 0 && (
          <div key={b.label} title={`${b.label}: ${b.pct}%`}
            style={{ width: `${b.pct}%` }}
            className={`${b.color} transition-all duration-700 first:rounded-l-full last:rounded-r-full`} />
        ))}
      </div>
      <div className="space-y-2.5">
        {bars.map(({ label, count, pct: p, Icon, text }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-3.5 w-3.5 ${text}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold tabular-nums ${text}`}>{formatNum(count)}</span>
              <span className="text-[11px] text-slate-400">{p}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");

      const payload = await getDashboardSummary();

      setDashboard({
        counts:
          payload?.counts ??
          initialDashboard.counts,

        salesStats:
          payload?.salesStats ??
          initialDashboard.salesStats,

        orderStats:
          payload?.orderStats ??
          initialDashboard.orderStats,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(true); }, [fetchDashboard]);

  if (loading) return <DashboardSkeleton />;

  const { counts, salesStats, orderStats } = dashboard;

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Platform overview — counts, sales, and order health.</p>
        </div>
        <button onClick={() => fetchDashboard(false)} disabled={refreshing}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} />}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="Users" value={formatNum(counts.userCount)} Icon={Users} accent="indigo" />
        <StatCard title="Products" value={formatNum(counts.productCount)} Icon={Package} accent="emerald" />
        <StatCard title="Categories" value={formatNum(counts.categoryCount)} Icon={Tag} accent="amber" />
        <StatCard title="Orders" value={formatNum(counts.orderCount)} Icon={ClipboardList} accent="pink" />
      </div>

      {/* Detail panels — 3 columns */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Sales Overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Sales Overview</h2>
          </div>
          <div className="space-y-2.5">
            <MetricRow label="Total Sales" value={formatCurrency(salesStats.totalSales)} accent="text-emerald-700" />
            <MetricRow label="Avg. Order Value" value={formatCurrency(salesStats.averageOrderValue)} />
            <MetricRow label="Paid Orders" value={formatNum(salesStats.paidOrderCount)} accent="text-indigo-700" />
            <MetricRow label="Total Payments" value={formatNum(salesStats.totalPaymentCount)} />
          </div>
        </div>

        {/* Order Breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Order Breakdown</h2>
          </div>
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{formatNum(orderStats.totalOrders)}</p>
          </div>
          <OrderStatusBar
            total={orderStats.totalOrders}
            completed={orderStats.completedOrders}
            pending={orderStats.pendingOrders}
            cancelled={orderStats.cancelledOrders}
          />
        </div>

        {/* Payment Health — uses new SalesStatsResponse fields */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <ShoppingCart className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Quick Health</h2>
          </div>
          <div className="space-y-2.5">

            {/* Payment breakdown using new backend fields */}
            <div className="rounded-xl bg-emerald-50 px-3.5 py-3 ring-1 ring-inset ring-emerald-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 opacity-80">Successful Payments</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {formatNum(salesStats.successPayments)}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-3.5 py-3 ring-1 ring-inset ring-amber-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 opacity-80">Pending Payments</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-amber-700">
                <Clock className="h-3.5 w-3.5" />
                {formatNum(salesStats.pendingPayments)}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 opacity-80">Failed Payments</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-rose-700">
                <XCircle className="h-3.5 w-3.5" />
                {formatNum(salesStats.failedPayments)}
              </p>
            </div>

            {/* Cancellation rate alert */}
            {orderStats.totalOrders > 0 && (orderStats.cancelledOrders / orderStats.totalOrders) > 0.2 && (
              <div className="rounded-xl bg-rose-50 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 opacity-80">High Cancellation Rate</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {Math.round((orderStats.cancelledOrders / orderStats.totalOrders) * 100)}% of orders cancelled
                </p>
              </div>
            )}

            {/* Catalog coverage */}
            <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-inset ring-slate-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 opacity-80">Catalog Coverage</p>
              <p className="mt-0.5 text-xs font-bold text-slate-700">
                {counts.categoryCount} categories · {counts.productCount} products
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}