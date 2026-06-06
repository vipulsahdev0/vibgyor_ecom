import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboardData } from "../../api/dashboardApi";

const initialDashboard = {
  counts: {
    userCount: 0,
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
  },
  salesStats: {
    totalSales: 0,
    averageOrderValue: 0,
    paidOrderCount: 0,
    totalPaymentCount: 0,
  },
  orderStats: {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  },
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");
      const data = await getDashboardData();

      setDashboard({
        counts: data?.counts ?? initialDashboard.counts,
        salesStats: data?.salesStats ?? initialDashboard.salesStats,
        orderStats: data?.orderStats ?? initialDashboard.orderStats,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard");
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(number);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-56 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Monitor platform counts, sales metrics, and order activity.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard(false)}
          disabled={refreshing}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchDashboard(false)}
            className="inline-flex w-fit items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={dashboard.counts.userCount}
          tone="text-indigo-600"
        />
        <StatCard
          title="Total Products"
          value={dashboard.counts.productCount}
          tone="text-emerald-600"
        />
        <StatCard
          title="Total Categories"
          value={dashboard.counts.categoryCount}
          tone="text-amber-500"
        />
        <StatCard
          title="Total Orders"
          value={dashboard.counts.orderCount}
          tone="text-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Sales Overview</h2>
          <div className="mt-5 space-y-4">
            <MetricRow
              label="Total Sales"
              value={formatCurrency(dashboard.salesStats.totalSales)}
            />
            <MetricRow
              label="Average Order Value"
              value={formatCurrency(dashboard.salesStats.averageOrderValue)}
            />
            <MetricRow
              label="Paid Orders"
              value={dashboard.salesStats.paidOrderCount}
            />
            <MetricRow
              label="Total Payments"
              value={dashboard.salesStats.totalPaymentCount}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order Overview</h2>
          <div className="mt-5 space-y-4">
            <MetricRow
              label="Total Orders"
              value={dashboard.orderStats.totalOrders}
            />
            <MetricRow
              label="Pending Orders"
              value={dashboard.orderStats.pendingOrders}
            />
            <MetricRow
              label="Completed Orders"
              value={dashboard.orderStats.completedOrders}
            />
            <MetricRow
              label="Cancelled Orders"
              value={dashboard.orderStats.cancelledOrders}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Health Check</h2>

          <div className="mt-5 grid gap-3">
            <HealthBadge
              label="Catalog Coverage"
              value={`${dashboard.counts.categoryCount} categories`}
              status="neutral"
            />
            <HealthBadge
              label="Order Flow"
              value={`${dashboard.orderStats.pendingOrders} pending`}
              status={
                dashboard.orderStats.pendingOrders > 20 ? "warn" : "good"
              }
            />
            <HealthBadge
              label="Payment Activity"
              value={`${dashboard.salesStats.totalPaymentCount} payments`}
              status="good"
            />
            <HealthBadge
              label="Customer Base"
              value={`${dashboard.counts.userCount} users`}
              status="neutral"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500">{title}</h2>
      <p className={`mt-3 text-3xl font-bold sm:text-4xl ${tone}`}>{value}</p>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function HealthBadge({ label, value, status }) {
  const statusClasses =
    status === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "warn"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <div className={`rounded-xl px-4 py-3 ring-1 ring-inset ${statusClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}