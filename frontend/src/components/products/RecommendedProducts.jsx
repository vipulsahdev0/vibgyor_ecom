import ProductGrid from "../products/ProductGrid";
import { Sparkles } from "lucide-react";

export default function RecommendedProducts({ products }) {
  if (!products?.length) return null;

  products
    .filter(
      p =>
        p.status === "ACTIVE" &&
        p.stockQuantity > 0
    )

  return (
    <section className="mt-16 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <Sparkles className="h-3 w-3" /> Recommended
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">You may also like</h2>
          <p className="mt-0.5 text-sm text-slate-500">Handpicked products based on your interest.</p>
        </div>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}