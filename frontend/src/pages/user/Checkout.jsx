import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { getUserAddresses } from "../../api/addressApi";
import { placeOrder } from "../../api/orderApi";
import { processPayment } from "../../api/paymentApi";
import AddressSelector from "../../components/checkout/AddressSelector";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";

const PAYMENT_METHOD_MAP = {
  cod: "CASH_ON_DELIVERY",
  upi: "UPI",
  card: "CREDIT_CARD",
};

const getApiPaymentMethod = (method) => PAYMENT_METHOD_MAP[method] || null;

function AddressSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <div className="flex gap-3">
            <div className="mt-1 h-4 w-4 rounded bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-36 rounded bg-slate-100" />
              <div className="h-3 w-56 rounded bg-slate-100" />
              <div className="h-3 w-40 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, clearAll } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    if (!user?.userId) {
      setAddresses([]);
      setSelectedAddress(null);
      setAddressLoading(false);
      return;
    }

    try {
      setAddressLoading(true);
      const data = await getUserAddresses(user.userId);
      const list = Array.isArray(data) ? data : [];

      setAddresses(list);

      const defaultAddress = list.find((a) => a.isDefault) || list[0] || null;
      setSelectedAddress(defaultAddress?.id ?? null);
    } catch (err) {
      console.error(err);
      setAddresses([]);
      setSelectedAddress(null);
      toast.error(err?.response?.data?.message || "Failed to load addresses");
    } finally {
      setAddressLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const canCheckout = useMemo(() => {
    return Boolean(
      user?.userId &&
        cart?.items?.length > 0 &&
        selectedAddress &&
        selectedMethod &&
        !loading &&
        !cartLoading
    );
  }, [
    user?.userId,
    cart?.items?.length,
    selectedAddress,
    selectedMethod,
    loading,
    cartLoading,
  ]);

  const handleCheckout = async () => {
    if (loading) return;

    if (!user?.userId) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    const apiPaymentMethod = getApiPaymentMethod(selectedMethod);

    if (!apiPaymentMethod) {
      toast.error("Invalid payment method selected");
      return;
    }

    setLoading(true);

    try {
      const order = await placeOrder(user.userId, {
        addressId: selectedAddress,
        paymentMethod: apiPaymentMethod,
        notes: "",
      });

      if (!order?.id) {
        throw new Error("Order creation failed");
      }

      let payment = null;

      if (apiPaymentMethod !== "CASH_ON_DELIVERY") {
        try {
          payment = await processPayment({
            orderId: order.id,
            amount: Number(order.totalAmount || 0),
            paymentMethod: apiPaymentMethod,
          });
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "";

          if (message.toLowerCase().includes("payment record already exists")) {
            await clearAll({ silent: true });
            toast.success("Payment already recorded");
            navigate("/account/orders", { replace: true });
            return;
          }

          toast.error("Order created, but payment recording failed.");
          navigate("/account/orders", { replace: true });
          return;
        }
      }

      const resolvedPaymentStatus =
        payment?.paymentStatus || order?.paymentStatus || "PENDING";

      await clearAll({ silent: true });

      toast.success(
        selectedMethod === "cod"
          ? "Order placed successfully"
          : "Order placed. Payment is being processed."
      );

      navigate(`/account/payment-success/${order.id}`, {
        replace: true,
        state: {
          orderId: order.id,
          orderNumber: order.orderNumber ?? null,
          paymentMethod: apiPaymentMethod,
          totalAmount: Number(order.totalAmount || 0),
          paymentStatus: resolvedPaymentStatus,
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);

      const details = err?.response?.data?.details;
      const message =
        Array.isArray(details) && details.length
          ? details.join(", ")
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Checkout failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <section className="space-y-8">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!cart?.items?.length) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <MapPin className="h-9 w-9" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add items before proceeding to checkout.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
        >
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete your order securely and review everything before placing it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
            <Truck className="h-3.5 w-3.5 text-indigo-600" />
            Fast delivery
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Delivery Address
            </h2>

            {addressLoading ? (
              <AddressSkeleton />
            ) : addresses.length > 0 ? (
              <AddressSelector
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <MapPin className="h-8 w-8 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    No addresses found
                  </p>
                  <p className="text-xs text-slate-500">
                    Add an address in your profile before placing an order.
                  </p>
                </div>
                <Link
                  to="/account/profile"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Go to Profile
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Payment Method
            </h2>
            <PaymentMethod
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
            />
          </div>
        </div>

        <OrderSummary
          cart={cart}
          loading={loading}
          onCheckout={handleCheckout}
          disabled={!canCheckout}
        />
      </div>
    </section>
  );
}