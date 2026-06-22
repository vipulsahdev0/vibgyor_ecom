import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import useCart from "../../hooks/useCart";

export default function AddToCartButton({ product, quantity = 1, className = "" }) {
  const { addToCart, loading } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
        text-white transition-all duration-150 active:scale-95 disabled:opacity-60
        ${added ? "bg-emerald-500 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"}
        ${className}`}
    >
      {added
        ? <><Check size={15} /> Added to Cart</>
        : <><ShoppingCart size={15} /> Add to Cart</>
      }
    </button>
  );
}

// USAGE:
// <AddToCartButton product={item} className="mt-auto w-full" />