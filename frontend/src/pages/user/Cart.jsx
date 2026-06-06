import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";

export default function Cart() {
  const { cart, loading, removeItem, updateCart, clearAll } = useCart();

  if (loading) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Loading cart...</h1>
        <p className="mt-3 text-slate-500">Please wait while we fetch your items.</p>
      </section>
    );
  }

  if (!cart?.items?.length) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-4 text-slate-500">
          Add products to continue shopping.
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
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="mt-2 text-slate-500">
            {cart.totalItems ?? cart.items.length} item(s) in your cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {cart.items.map((item) => (
            <CartItem
              key={item.cartItemId ?? item.productId}
              item={item}
              onRemove={() => removeItem(item.productId)}
              onUpdate={(quantity) => updateCart(item.productId, quantity)}
            />
          ))}
        </div>

        <CartSummary
          subtotal={cart.subtotal}
          discount={cart.discountTotal}
          total={cart.grandTotal}
          totalItems={cart.totalItems ?? cart.items.length}
          onClear={clearAll}
        />
      </div>
    </section>
  );
}