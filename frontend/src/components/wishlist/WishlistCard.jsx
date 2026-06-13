import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import useCart from "../../hooks/useCart";

const formatCurrency = (amount) =>
  amount == null
    ? "₹0.00"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

export default function WishlistCard({ item, onRemove }) {
  const { addToCart, loading: cartLoading } = useCart();
  const [cartAdded, setCartAdded] = useState(false);

  const image =
    item.imageUrl ||
    item.productImageUrl ||
    item.images?.[0]?.imageUrl ||
    "https://placehold.co/600x400?text=No+Image";

  const handleAddToCart = async () => {
    await addToCart(
      {
        productId:   item.productId,
        productName: item.productName,
        price:       item.price,
        images:      [{ imageUrl: image }],
      },
      1
    );
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={item.productName || "Product"}
          width={600} height={400}
          loading="lazy"
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Remove from wishlist */}
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-sm transition hover:bg-rose-500 hover:text-white active:scale-95"
        >
          <Heart size={15} className="fill-current" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 text-sm font-bold text-slate-900">
          {item.productName || "Unnamed Product"}
        </h2>

        {item.categoryName && (
          <p className="mt-0.5 text-xs font-medium text-indigo-500">
            {item.categoryName}
          </p>
        )}

        <p className="mt-2 text-base font-black text-indigo-600">
          {formatCurrency(item.price)}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={cartLoading}
          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-60 ${
            cartAdded
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {cartAdded
            ? <><Check size={15} /> Added to Cart</>
            : <><ShoppingCart size={15} /> Add to Cart</>
          }
        </button>
      </div>
    </article>
  );
}