import { useState } from "react";

export default function ProductForm({
  categories,
  onSubmit,
  loading = false,
}) {

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
      status: "ACTIVE",
      images: [],
    });

  const [imageUrl, setImageUrl] =
    useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;

    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          imageUrl: imageUrl.trim(),
          isPrimary: prev.images.length === 0,
          displayOrder: prev.images.length,
        },
      ],
    }));
    setImageUrl("");
  };

  const removeImage = (index) => {

    setFormData((prev) => ({
      ...prev,
      imageUrls:
        prev.imageUrls.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    onSubmit({
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(
        formData.stockQuantity
      ),
      categoryId: Number(
        formData.categoryId
      ),
    });
  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-lg"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        className="w-full border p-3 rounded-lg"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-lg"
      />

      <input
        type="number"
        name="stockQuantity"
        placeholder="Stock Quantity"
        value={formData.stockQuantity}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-lg"
      />

      <select
        name="categoryId"
        value={formData.categoryId}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-lg"
      >

        <option value="">
          Select Category
        </option>

        {
          categories.map((category) => (

            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))
        }

      </select>


      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg"
      >
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>

      <div className="flex gap-3">

        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) =>
            setImageUrl(e.target.value)
          }
          className="flex-1 border p-3 rounded-lg"
        />

        <button
          type="button"
          onClick={addImage}
          className="bg-black text-white px-5 rounded-lg"
        >
          Add
        </button>

      </div>

      {
        formData.images.length > 0 && (

          <div className="space-y-2">

            {
              formData.images.map(
                (img, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg"
                  >

                    <img
                      src={img.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    <p className="flex-1 text-sm break-all">
                      {img.imageUrl}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      Remove
                    </button>

                  </div>
                )
              )
            }

          </div>
        )
      }

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
      >
        {
          loading
            ? "Saving..."
            : "Create Product"
        }
      </button>

    </form>
  );
}