const ADDRESS_TYPE_STYLES = {
  SHIPPING: "bg-blue-50 text-blue-700",
  BILLING: "bg-amber-50 text-amber-700",
};

export default function AddressCard({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  const addressId = address?.id ?? address?.addressId;

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{address?.fullName}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {address?.addressType && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ADDRESS_TYPE_STYLES[address.addressType] || "bg-slate-100 text-slate-700"
                  }`}
              >
                {address.addressType}
              </span>
            )}

            {(isDefault || address?.isDefault) && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700">
                Default
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-slate-600">
        <p>{address?.addressLine1}</p>
        {address?.addressLine2 ? <p>{address.addressLine2}</p> : null}
        <p>
          {address?.city}, {address?.state}
        </p>
        <p>
          {address?.country} - {address?.zipCode}
        </p>
        <p className="pt-2">{address?.mobile}</p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button
          type="button"
          onClick={() => onEdit?.(address)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        {onSetDefault && !(isDefault || address?.isDefault) && (
          <button
            type="button"
            onClick={() => onSetDefault(addressId)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Set Default
          </button>
        )}

        {onDelete && !address?.isDefault && (
          <button
            type="button"
            onClick={() => onDelete(addressId)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}