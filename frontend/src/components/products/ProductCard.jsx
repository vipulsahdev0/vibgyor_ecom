import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye, Check } from "lucide-react";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ProductCard({ product }) {
  const { addToCart, loading: cartLoading } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const [cartAdded, setCartAdded] = useState(false);

  const isActive = product?.status === "ACTIVE";
  const outOfStock = Number(product?.stockQuantity ?? 0) <= 0;
  const isUnavailable = !isActive || outOfStock;

  const image =
    product?.primaryImageUrl ||
    product?.images?.find((img) => img?.isPrimary)?.imageUrl ||
    product?.images?.[0]?.imageUrl ||
    "https://placehold.co/600x400?text=No+Image";

  const originalPrice = Number(product?.price || 0);
  const finalPrice = Number(
    product?.finalPrice ?? product?.discountedPrice ?? product?.price ?? 0
  );

  const hasDiscount =
    originalPrice > 0 &&
    finalPrice > 0 &&
    originalPrice > finalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const inWishlist = isInWishlist?.(product?.id) ?? false;

  const handleAddToCart = async () => {
    if (!isActive) {
      toast.error("Product unavailable");
      return;
    }

    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }

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

  const statusLabel = !isActive
    ? "Unavailable"
    : outOfStock
      ? "Out of Stock"
      : "In Stock";

  const statusClass = !isActive
    ? "bg-slate-700 text-white"
    : outOfStock
      ? "bg-rose-500 text-white"
      : "bg-emerald-500 text-white";

  const buttonLabel = cartAdded
    ? "Added"
    : !isActive
      ? "Unavailable"
      : outOfStock
        ? "Sold Out"
        : "Add";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative overflow-hidden bg-slate-50">
        <Link to={`/products/${product.id}`} aria-label={`View ${product.name || "product"}`}>
          <img
            src={image}
            alt={product?.name || "Product image"}
            width={600}
            height={400}
            loading="lazy"
            className={`h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isUnavailable ? "opacity-90 saturate-75" : ""
              }`}
          />
        </Link>

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>

        {hasDiscount && (
          <span className="absolute left-3 top-11 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
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

          <Link
            to={`/products/${product.id}`}
            aria-label="View product details"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:bg-indigo-600 hover:text-white"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          {product?.categoryName || "Uncategorized"}
        </p>

        <h2 className="mt-1.5 min-h-[2.75rem] line-clamp-2 text-sm font-bold leading-5 text-slate-900">
          <Link
            to={`/products/${product.id}`}
            className="transition-colors hover:text-indigo-600"
          >
            {product?.name || "Unnamed Product"}
          </Link>
        </h2>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
          <span>{product?.categoryName || "Uncategorized"}</span>
          <span>•</span>
          <span>{Number(product?.stockQuantity ?? 0)} available</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className={`text-lg font-black ${isUnavailable ? "text-slate-500" : "text-indigo-600"}`}>
              {formatCurrency(finalPrice)}
            </p>

            {hasDiscount && (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isActive || outOfStock || cartLoading}
            aria-label={outOfStock || !isActive ? statusLabel : "Add to cart"}
            className={`inline-flex min-w-[102px] items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed ${!isActive
                ? "bg-slate-300 text-white"
                : outOfStock
                  ? "bg-rose-300 text-white"
                  : cartAdded
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {cartAdded ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                {buttonLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}