import { ShoppingBag } from "lucide-react";
import ProductCard from "./ProductCard";

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-56 bg-slate-100" />
          <div className="p-4 space-y-2.5">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-16 rounded bg-slate-100" />
              <div className="h-8 w-20 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products = [], loading = false, skeletonCount = 8 }) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />;

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">No Products Found</h2>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}