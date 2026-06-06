import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getCategories } from "../../api/categoryApi";
import { Link } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();

      const activeCategories = (Array.isArray(data) ? data : []).filter(
        (item) => item.status === "ACTIVE"
      );

      setCategories(activeCategories);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="py-20 text-center text-2xl font-semibold text-slate-700">
        Loading categories...
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Categories</h1>
        <p className="mt-2 text-slate-500">Browse active product categories.</p>
      </div>

      {!categories.length ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">No categories found</h2>
          <p className="mt-3 text-slate-500">
            Categories are not available right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <article
              key={category.id}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">
                <Link
                  to={`/products?categoryId=${category.id}`}
                  className="hover:text-indigo-600 transition"
                >
                  {category.categoryName}
                </Link>
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {category.description || "No description available."}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  {category.status}
                </span>
                <span className="text-sm text-slate-500">
                  {category.productCount ?? 0} products
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}