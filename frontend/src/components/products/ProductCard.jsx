import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import useCart from "../../hooks/useCart";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();

  const image =
    product.primaryImageUrl ||
    product.images?.[0]?.imageUrl ||
    "https://placehold.co/600x400";

  const outOfStock = (product.stockQuantity ?? 0) <= 0;

  const displayPrice = Number(
    product.finalPrice ?? product.discountedPrice ?? product.price ?? 0
  ).toFixed(2);

  const handleAdd = async () => {
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }

    await addToCart(product, 1);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 border border-slate-100">
      <div className="relative overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.name || "Product image"}
          className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {outOfStock ? (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            Out of Stock
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            In Stock
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
            aria-label="Add to wishlist"
            title="Add to wishlist"
          >
            <Heart size={18} />
          </button>

          <Link
            to={`/products/${product.id}`}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-indigo-600 hover:text-white transition"
            aria-label="View product details"
            title="View details"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide">
            {product.categoryName || "Uncategorized"}
          </p>

          <h2 className="text-xl font-bold mt-2 line-clamp-1 text-slate-900">
            {product.name || "Unnamed Product"}
          </h2>

          <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed">
            {product.description || "No description available"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            <p className="text-3xl font-black text-indigo-600">
              ₹{displayPrice}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={loading || outOfStock}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl transition font-semibold"
            aria-label={outOfStock ? "Out of stock" : "Add to cart"}
            title={outOfStock ? "Out of stock" : "Add to cart"}
          >
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}