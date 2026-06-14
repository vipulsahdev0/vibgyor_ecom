import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { getOrderById, cancelOrder } from "../../api/orderApi";

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
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const PAYMENT_STYLES = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-slate-100 text-slate-700",
};

const badgeClass = (status, map) =>
  map?.[status?.toUpperCase()] ??
  "bg-slate-100 text-slate-600";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-100" />
      <div className="h-64 rounded-2xl bg-slate-100" />
      <div className="h-40 rounded-2xl bg-slate-100" />
    </div>
  );
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrderById(orderId);

      setOrder(data);

      try {
        if (data?.shippingAddressSnapshot) {
          setAddress(JSON.parse(data.shippingAddressSnapshot));
        }
      } catch {
        setAddress(null);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load order."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);

      await cancelOrder(order.id);

      toast.success("Order cancelled successfully");

      fetchOrder();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Unable to cancel order"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancel =
    order &&
    ["PENDING", "CONFIRMED"].includes(order.orderStatus);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/account/orders"
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">
            Order Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            #{order.orderNumber}
          </p>
        </div>

        <button
          onClick={fetchOrder}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary */}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Order Date
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Order Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                order.orderStatus,
                STATUS_STYLES
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Payment Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                order.paymentStatus,
                PAYMENT_STYLES
              )}`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Address */}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={18} />
          <h2 className="font-semibold text-slate-900">
            Shipping Address
          </h2>
        </div>

        {address ? (
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              {address.fullName}
            </p>

            <p>{address.mobile}</p>

            <p>{address.addressLine1}</p>

            {address.addressLine2 && (
              <p>{address.addressLine2}</p>
            )}

            <p>
              {address.city}, {address.state}
            </p>

            <p>
              {address.country} - {address.zipCode}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Address information unavailable.
          </p>
        )}
      </div>

      {/* Items */}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <Package size={18} />
            <h2 className="font-semibold text-slate-900">
              Ordered Items
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div
              key={item.orderItemId}
              className="flex gap-4 p-5"
            >
              <img
                src={
                  item.productImageUrl ||
                  "https://placehold.co/100x100?text=Product"
                }
                alt={item.productName}
                className="h-20 w-20 rounded-xl border object-cover"
              />

              <div className="flex-1">
                <h3 className="font-medium text-slate-900">
                  {item.productName}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quantity: {item.quantity}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Price: {formatCurrency(item.price)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {formatCurrency(item.lineTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} />
          <h2 className="font-semibold text-slate-900">
            Order Summary
          </h2>
        </div>

        <div className="flex items-center justify-between text-lg font-bold text-slate-900">
          <span>Total Amount</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/products"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Continue Shopping
        </Link>

        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {cancelLoading
              ? "Cancelling..."
              : "Cancel Order"}
          </button>
        )}
      </div>
    </section>
  );
}