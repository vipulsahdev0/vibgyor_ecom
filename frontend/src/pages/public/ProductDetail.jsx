// pages/public/ProductDetail.jsx
// GET /api/products/{id} → ProductResponse { id, name, description, price, stockQuantity, status,
//   categoryId, categoryName, images[{id, imageUrl, isPrimary}] }

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart, Heart, ArrowLeft, Minus, Plus, Package,
  CheckCircle2, XCircle, Loader2, Star
} from "lucide-react";
import { getProductById } from "../../api/productApi";
import { addToCart } from "../../api/cartApi";
import { addToWishlist } from "../../api/wishlistApi";
import { getStoredAuth } from "../../api/axios";
import toast from "react-hot-toast";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v || 0));

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = getStoredAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // GET /api/products/{id} → ApiResponse<ProductResponse>
    getProductById(id)
      .then(data => {
        setProduct(data);
        const primary = data?.images?.find(i => i.isPrimary)?.imageUrl || data?.images?.[0]?.imageUrl || null;
        setActiveImage(primary);
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error("Please login first"); navigate("/login"); return; }
    if (quantity < 1 || quantity > (product?.stockQuantity || 0)) return;
    setCartLoading(true);
    try {
      // POST /api/users/{userId}/cart/items { productId, quantity }
      await addToCart(user.userId, product.id, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    } finally { setCartLoading(false); }
  };

  const handleAddToWishlist = async () => {
    if (!user) { toast.error("Please login first"); navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      // POST /api/users/{userId}/wishlist/items { productId }
      await addToWishlist(user.userId, product.id);
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err?.message || "Failed to add to wishlist");
    } finally { setWishlistLoading(false); }
  };

  if (loading) return (
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

  if (!product) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Package className="h-12 w-12 text-slate-300" />
      <p className="text-sm text-slate-500">Product not found.</p>
      <Link to="/products" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Browse Products</Link>
    </div>
  );

  const inStock = product.stockQuantity > 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-700">Products</Link>
          <span>/</span>
          <span className="truncate font-medium text-slate-700">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
              {activeImage
                ? <img src={activeImage} alt={product.name} width={600} height={600} className="h-full w-full object-cover aspect-square" />
                : <div className="flex aspect-square items-center justify-center"><Package className="h-20 w-20 text-slate-200" /></div>
              }
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map(img => (
                  <button key={img.id} onClick={() => setActiveImage(img.imageUrl)}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImage === img.imageUrl ? "border-indigo-500" : "border-transparent hover:border-slate-200"}`}>
                    <img src={img.imageUrl} alt="" width={64} height={64} className="h-16 w-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.categoryName && (
                <Link to={`/categories/${product.categoryId}`} className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:underline">
                  {product.categoryName}
                </Link>
              )}
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.name}</h1>
              <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(product.price)}</p>
            </div>

            {/* Stock status */}
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
              {inStock
                ? <><CheckCircle2 className="h-4 w-4" /> In Stock ({product.stockQuantity} available)</>
                : <><XCircle className="h-4 w-4" /> Out of Stock</>
              }
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
            )}

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                    className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40" aria-label="Decrease">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-semibold text-slate-800 tabular-nums">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} disabled={quantity >= product.stockQuantity}
                    className="px-3 py-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40" aria-label="Increase">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!inStock || cartLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300">
                {cartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button onClick={handleAddToWishlist} disabled={wishlistLoading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
                aria-label="Add to wishlist">
                {wishlistLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
              </button>
            </div>

            <Link to="/products" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}