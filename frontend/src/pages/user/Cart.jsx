import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import useCart from "../../hooks/useCart";
import CartItem    from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm animate-pulse">
          <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-48 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Cart() {
  const { cart, loading, removeItem, updateCart, clearAll } = useCart();

  if (loading) {
    return (
      <section className="space-y-8">
        <div>
          <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2"><CartSkeleton /></div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!cart?.items?.length) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <ShoppingCart className="h-9 w-9" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-500">Add products to continue shopping.</p>
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

  const itemCount = cart.totalItems ?? cart.items.length;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          </p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 self-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-100 active:scale-95 sm:self-auto"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear Cart
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <CartItem
              key={item.cartItemId ?? item.productId}
              item={item}
              onRemove={() => removeItem(item.productId)}
              onUpdate={(qty) => updateCart(item.productId, qty)}
            />
          ))}
        </div>
        <CartSummary
          subtotal={cart.subtotal}
          discount={cart.discountTotal}
          total={cart.grandTotal}
          totalItems={itemCount}
          onClear={clearAll}
        />
      </div>
    </section>
  );
}