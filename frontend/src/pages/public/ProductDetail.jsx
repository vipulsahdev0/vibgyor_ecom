import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  BadgePercent,
  Tag,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProductById } from "../../api/productApi";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import RecommendedProducts from "../../components/products/RecommendedProducts";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, loading: cartLoading } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getProductById(id)
      .then((data) => {
        setProduct(data);

        const orderedImages = [...(data?.images || [])].sort((a, b) => {
          const aOrder = a?.displayOrder ?? Number.MAX_SAFE_INTEGER;
          const bOrder = b?.displayOrder ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder;
        });

        const primary =
          orderedImages.find((img) => img.isPrimary)?.imageUrl ||
          orderedImages[0]?.imageUrl ||
          null;

        setActiveImage(primary);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load product");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    return [...(product?.images || [])].sort((a, b) => {
      const aOrder = a?.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b?.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  }, [product?.images]);

  const isActive = product?.status === "ACTIVE";
  const inStock = Number(product?.stockQuantity || 0) > 0;
  const canBuy = isActive && inStock;

  const originalPrice = Number(product?.price || 0);
  const finalPrice = Number(
    product?.finalPrice ?? product?.discountedPrice ?? product?.price ?? 0
  );
  const hasDiscount = originalPrice > finalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const inWishlist = isInWishlist?.(product?.id) ?? false;

  const handleAddToCart = async () => {
    if (!canBuy) {
      toast.error(!isActive ? "Product unavailable" : "Out of stock");
      return;
    }

    await addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = async () => {
    if (!product?.id || wishlistLoading) return;

    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-slate-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-slate-100" />
            <div className="h-6 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Package className="h-12 w-12 text-slate-300" />
        <p className="text-sm text-slate-500">Product not found.</p>
        <Link
          to="/products"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-700">Products</Link>
          <span>/</span>
          <span className="truncate font-medium text-slate-700">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <Package className="h-20 w-20 text-slate-200" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === img.imageUrl
                        ? "border-indigo-500"
                        : "border-transparent hover:border-slate-200"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      width={72}
                      height={72}
                      className="h-18 w-18 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              {product.categoryName && (
                <Link
                  to={`/products?categoryId=${product.categoryId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:bg-indigo-100"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {product.categoryName}
                </Link>
              )}

              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-3xl font-black text-slate-900">
                  {formatCurrency(finalPrice)}
                </p>

                {hasDiscount && (
                  <>
                    <p className="text-lg font-semibold text-slate-400 line-through">
                      {formatCurrency(originalPrice)}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <BadgePercent className="h-3.5 w-3.5" />
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {product.sku && (
                <p className="mt-2 text-xs font-medium text-slate-400">
                  SKU: <span className="text-slate-600">{product.sku}</span>
                </p>
              )}
            </div>

            <div
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                canBuy ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {canBuy ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  In Stock ({product.stockQuantity} available)
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  {!isActive ? "Currently Unavailable" : "Out of Stock"}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Genuine pricing and live stock synced from backend
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Product details are loaded from the product detail API for this item.
              </p>
            </div>

            {canBuy && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-semibold text-slate-800 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                    }
                    disabled={quantity >= product.stockQuantity}
                    className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!canBuy || cartLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {cartLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                {canBuy ? "Add to Cart" : "Unavailable"}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
                  inWishlist
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                aria-label="Toggle wishlist"
              >
                {wishlistLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        <RecommendedProducts products={[]} />
      </div>
    </main>
  );
}