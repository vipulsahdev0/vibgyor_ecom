import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts } from "../../api/productApi";
import ProductGrid from "../../components/products/ProductGrid";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const selectedCategoryId = searchParams.get("categoryId");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (selectedCategoryId) params.categoryId = Number(selectedCategoryId);

      const data = await getProducts(params);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search.trim()) {
      filtered = filtered.filter((product) =>
        product.productName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "low":
        filtered.sort(
          (a, b) =>
            Number(a.finalPrice ?? a.price ?? 0) -
            Number(b.finalPrice ?? b.price ?? 0)
        );
        break;
      case "high":
        filtered.sort(
          (a, b) =>
            Number(b.finalPrice ?? b.price ?? 0) -
            Number(a.finalPrice ?? a.price ?? 0)
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [products, search, sort]);

  if (loading) {
    return (
      <div className="py-20 text-center text-2xl font-semibold">
        Loading products...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 rounded-3xl bg-indigo-600 p-10 text-white">
        <h1 className="text-4xl font-black sm:text-5xl">Discover Products</h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">
          Explore curated products across categories with smart filtering and pricing.
        </p>
      </div>

      <div className="mb-10 flex flex-col justify-between gap-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:flex-row">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-slate-200 px-5 py-3"
        >
          <option value="latest">Latest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  );
}