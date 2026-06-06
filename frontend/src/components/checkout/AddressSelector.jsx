const ADDRESS_TYPE_STYLES = {
  SHIPPING: "bg-blue-50 text-blue-600",
  BILLING: "bg-amber-50 text-amber-700",
};

export default function AddressSelector({
  addresses,
  selectedAddress,
  setSelectedAddress,
}) {
  const getAddressId = (address) => address.id ?? address.addressId;

  return (
    <div className="space-y-3">
      {addresses.map((address) => {
        const addressId = getAddressId(address);
        const isSelected = selectedAddress === addressId;

        return (
          <button
            key={addressId}
            type="button"
            onClick={() => setSelectedAddress(addressId)}
            className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-150 ${isSelected
                ? "border-indigo-500 bg-indigo-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900 text-base">
                    {address.fullName}
                  </span>

                  {address.addressType && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ADDRESS_TYPE_STYLES[address.addressType] ||
                        "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {address.addressType}
                    </span>
                  )}

                  {address.isDefault && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
                      Default
                    </span>
                  )}
                </div>

                {address.addressLine1 && (
                  <p className="text-sm text-slate-600 truncate">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  </p>
                )}

                <p className="text-sm text-slate-600">
                  {[address.city, address.state].filter(Boolean).join(", ")}
                </p>

                <p className="text-sm text-slate-500">
                  {[address.country, address.zipCode].filter(Boolean).join(" - ")}
                </p>

                {address.mobile && (
                  <p className="text-sm text-slate-500 mt-1">📞 {address.mobile}</p>
                )}
              </div>

              <div
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-slate-300 bg-white"
                  }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}