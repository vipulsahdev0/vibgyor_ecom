import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import useWishlist from "../../hooks/useWishlist";
import WishlistCard from "../../components/wishlist/WishlistCard";

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="aspect-square bg-slate-100" />
          <div className="p-4 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-8 w-full rounded-xl bg-slate-100 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, loading, fetching, removeFromWishlist } = useWishlist();

  if (loading || fetching) {
    return (
      <section className="space-y-8">
        <div>
          <div className="h-7 w-36 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-100" />
        </div>
        <WishlistSkeleton />
      </section>
    );
  }

  if (!wishlist?.length) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-400">
          <Heart className="h-9 w-9" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h1>
          <p className="mt-2 text-sm text-slate-500">Save products you love and revisit them anytime.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
        >
          Explore Products <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const count = wishlist.length;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Wishlist</h1>
        <p className="mt-1 text-sm text-slate-500">
          {count} saved item{count !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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