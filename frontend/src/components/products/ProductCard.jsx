import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye, Check } from "lucide-react";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function ProductCard({ product }) {
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading } = useWishlist();

  const [cartAdded, setCartAdded] = useState(false);

  const isActive =
    product.status === "ACTIVE";



  const image =
    product.primaryImageUrl ||
    product.images?.[0]?.imageUrl ||
    "https://placehold.co/600x400?text=No+Image";

  const outOfStock = (product.stockQuantity ?? 0) <= 0;

  const originalPrice =
    Number(product.price || 0);

  const finalPrice =
    Number(
      product.finalPrice ??
      product.discountedPrice ??
      product.price
    );
  const hasDiscount = originalPrice > finalPrice && originalPrice !== finalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const inWishlist = isInWishlist?.(product.id) ?? false;

  // ── Handlers ────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (outOfStock) { toast.error("Out of stock"); return; }
    await addToCart(product, 1);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

      {/* ── Image ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={product.name || "Product image"}
          width={600} height={400}
          loading="lazy"
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Stock badge */}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${outOfStock ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
          }`}>
          {outOfStock ? "Out of Stock" : "In Stock"}
        </span>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-10 mt-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        {!isActive && (
          <span>
            Unavailable
          </span>
        )}

        {/* Hover action buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-150 disabled:opacity-50 ${inWishlist
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-white text-slate-600 hover:bg-rose-500 hover:text-white"
              }`}
          >
            <Heart size={16} className={inWishlist ? "fill-current" : ""} />
          </button>

          {/* Quick view */}
          <Link
            to={`/products/${product.id}`}
            aria-label="View product details"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:bg-indigo-600 hover:text-white"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          {product.categoryName || "Uncategorized"}
        </p>

        <h2 className="mt-1.5 line-clamp-1 text-sm font-bold text-slate-900">
          <Link to={`/products/${product.id}`} className="hover:text-indigo-600 transition-colors">
            {product.name || "Unnamed Product"}
          </Link>
        </h2>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {product.description || "No description available"}
        </p>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-black text-indigo-600">
              ₹{finalPrice.toFixed(2)}
            </p>
            {hasDiscount && originalPrice > finalPrice && (
              <p className="text-xs text-slate-400 line-through">
                ₹{originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !isActive ||
              outOfStock ||
              cartLoading
            } aria-label={outOfStock ? "Out of stock" : "Add to cart"}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${cartAdded
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {cartAdded
              ? <><Check size={15} /> Added</>
              : <><ShoppingCart size={15} /> Add</>
            }
          </button>
        </div>
      </div>
    </article>
  );
}