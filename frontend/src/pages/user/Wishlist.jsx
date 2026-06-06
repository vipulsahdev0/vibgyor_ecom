import { Link } from "react-router-dom";
import useWishlist from "../../hooks/useWishlist";
import WishlistCard from "../../components/wishlist/WishlistCard";

export default function Wishlist() {
  const { wishlist, loading, fetching, removeFromWishlist } = useWishlist();

  if (loading || fetching) {
    return (
      <section className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Loading wishlist...
        </h1>
        <p className="mt-4 text-slate-500">
          Please wait while we fetch your saved items.
        </p>
      </section>
    );
  }

  if (!wishlist?.length) {
    return (
      <section className="py-24 text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          Your wishlist is empty
        </h1>

        <p className="mt-4 text-slate-500">
          Save products you love and revisit them anytime.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Explore Products
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">My Wishlist</h1>
        <p className="mt-2 text-slate-500">Your saved products.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <WishlistCard
            key={item.wishlistItemId ?? item.productId}
            item={item}
            onRemove={() => removeFromWishlist(item.productId)}
          />
        ))}
      </div>
    </section>
  );
}