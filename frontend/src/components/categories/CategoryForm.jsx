import { useEffect, useState } from "react";

export default function CategoryForm({
  onSubmit,
  initialData = null,
  loading = false,
}) {

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {

    if (initialData) {

      setFormData({
        name:
          initialData.categoryName || "",
        description:
          initialData.description || "",
      });

    } else {

      setFormData({
        name: "",
        description: "",
      });
    }

  }, [initialData]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit(formData);
  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <input
        type="text"
        name="name"
        required
        placeholder="Category Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg"
        rows={4}
      />

      <button
        disabled={loading}
        className="bg-indigo-600 text-white px-5 py-3 rounded-lg"
      >

        {
          loading
            ? "Saving..."
            : "Save Category"
        }

      </button>

    </form>
  );
}