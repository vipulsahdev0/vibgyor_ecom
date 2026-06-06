import { useEffect, useState } from "react";

const ADDRESS_TYPES = ["SHIPPING", "BILLING"];

const EMPTY_FORM = {
  fullName: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  addressType: "SHIPPING",
  isDefault: false,
};

export default function AddressForm({ initialData, onSubmit, loading, onCancel }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        mobile: initialData.mobile || "",
        addressLine1: initialData.addressLine1 || "",
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "",
        zipCode: initialData.zipCode || "",
        addressType: initialData.addressType || "SHIPPING",
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      zipCode: formData.zipCode.trim(),
      addressType: formData.addressType,
      isDefault: Boolean(formData.isDefault),
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-1">
        {initialData ? "Edit Address" : "Add New Address"}
      </h2>

      <p className="text-sm text-slate-400 mb-6">
        {initialData
          ? "Update your saved address details."
          : "Fill in the details to save a new address."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Vipul Sahdev"
            value={formData.fullName}
            onChange={handleChange}
            required
            maxLength={200}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            placeholder="+91 9876543210"
            value={formData.mobile}
            onChange={handleChange}
            required
            maxLength={15}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-600">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            placeholder="House/Flat No., Building Name, Street"
            value={formData.addressLine1}
            onChange={handleChange}
            required
            maxLength={255}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-600">
            Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="addressLine2"
            placeholder="Landmark, Area (optional)"
            value={formData.addressLine2}
            onChange={handleChange}
            maxLength={255}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            placeholder="West Delhi"
            value={formData.city}
            onChange={handleChange}
            required
            maxLength={100}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            placeholder="Delhi"
            value={formData.state}
            onChange={handleChange}
            required
            maxLength={100}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            placeholder="India"
            value={formData.country}
            onChange={handleChange}
            required
            maxLength={100}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            Zip Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="zipCode"
            placeholder="110015"
            value={formData.zipCode}
            onChange={handleChange}
            required
            maxLength={20}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-600">
            Address Type <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {ADDRESS_TYPES.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                  formData.addressType === type
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="addressType"
                  value={type}
                  checked={formData.addressType === type}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="w-4 h-4 accent-indigo-600 rounded"
          />
          <label
            htmlFor="isDefault"
            className="text-sm font-medium text-slate-600 cursor-pointer"
          >
            Set as default address
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {loading ? "Saving..." : initialData ? "Update Address" : "Save Address"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}