import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import toast from "react-hot-toast";

export default function Home() {
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const activeCategories = (Array.isArray(data) ? data : []).filter(
        (category) => category.status === "ACTIVE"
      );
      setCategories(activeCategories.slice(0, 8));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-indigo-600 p-10 text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">Vibgyor Ecommerce</h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">
          Shop smarter with a clean browsing experience across categories, products,
          wishlist, cart, and checkout.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/products"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700"
          >
            Explore Products
          </Link>
          <Link
            to="/categories"
            className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white"
          >
            View Categories
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Categories</h2>
          <Link to="/categories" className="text-sm font-semibold text-indigo-600">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className="rounded-2xl bg-white p-6 text-center shadow-sm transition hover:shadow-lg hover:border-indigo-200 border border-slate-100"
            >
              <h3 className="text-lg font-semibold text-slate-900">{category.categoryName}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {category.description || "Browse products in this category."}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}