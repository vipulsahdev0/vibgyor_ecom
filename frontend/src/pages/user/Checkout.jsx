import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, fetchBackendCart, clearAll } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setAddressLoading(true);

      const data = await getUserAddresses(user.userId);
      const addressList = Array.isArray(data) ? data : [];

      setAddresses(addressList);

      const defaultAddress =
        addressList.find((address) => address.isDefault) || addressList[0];

      setSelectedAddress(defaultAddress?.id ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load addresses");
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
      cart?.items?.length &&
      selectedAddress &&
      selectedMethod &&
      !loading &&
      !cartLoading
    );
  }, [user?.userId, cart?.items, selectedAddress, selectedMethod, loading, cartLoading]);

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

    try {
      setLoading(true);

      const order = await placeOrder(user.userId, {
        addressId: selectedAddress,
        paymentMethod: apiPaymentMethod,
        notes: "",
      });

      const payment = await processPayment({
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: apiPaymentMethod,
      });

      const resolvedPaymentStatus =
        payment?.paymentStatus || order?.paymentStatus || "PENDING";

      toast.success(
        selectedMethod === "cod"
          ? "Order placed successfully"
          : "Order placed. Payment is being processed."
      );

      if (typeof fetchBackendCart === "function") {
        await fetchBackendCart();
      } else if (typeof clearAll === "function") {
        await clearAll();
      }

      navigate(`/account/payment-success/${order.id}`, {
        replace: true,
        state: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentMethod: apiPaymentMethod,
          totalAmount: order.totalAmount,
          paymentStatus: resolvedPaymentStatus,
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      console.error("Response data:", error?.response?.data);

      const details = error?.response?.data?.details;
      const message =
        details?.length
          ? details.join(", ")
          : error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Checkout failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Loading checkout...</h1>
        <p className="mt-3 text-slate-500">Preparing your cart details.</p>
      </section>
    );
  }

  if (!cart?.items?.length) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-4 text-slate-500">
          Add items before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-2 text-slate-500">Complete your order securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Select Address
            </h2>

            {addressLoading ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">Loading addresses...</p>
              </div>
            ) : addresses.length > 0 ? (
              <AddressSelector
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
              />
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">
                  No addresses found
                </h3>
                <p className="mt-3 text-slate-500">
                  Add an address before placing your order.
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
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