import ProductGrid from "../products/ProductGrid";

export default function RecommendedProducts({
  products,
}) {

  if (!products?.length) {
    return null;
  }

  return (

    <div className="mt-20">

      <div className="mb-8">

        <h2 className="text-4xl font-black">
          Recommended Products
        </h2>

        <p className="text-slate-500 mt-2">
          You may also like these products.
        </p>

      </div>

      <ProductGrid products={products} />

    </div>
  );
}