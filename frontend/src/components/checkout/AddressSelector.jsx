import { Check, Phone, MapPin } from "lucide-react";

const ADDRESS_TYPE_STYLES = {
  SHIPPING: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  BILLING:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const getAddressId = (a) => a.id ?? a.addressId;

function formatAddress(address) {
  const lines = [
    [address.addressLine1, address.addressLine2].filter(Boolean).join(", "),
    [address.city, address.state].filter(Boolean).join(", "),
    [address.country, address.zipCode].filter(Boolean).join(" - "),
  ].filter(Boolean);
  return lines;
}

export default function AddressSelector({ addresses, selectedAddress, setSelectedAddress }) {
  return (
    <div className="space-y-3">
      {addresses.map((address) => {
        const addrId     = getAddressId(address);
        const isSelected = selectedAddress === addrId;
        const lines      = formatAddress(address);

        return (
          <button
            key={addrId}
            type="button"
            onClick={() => setSelectedAddress(addrId)}
            className={`group w-full rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
              isSelected
                ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">

              {/* Radio dot */}
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
              }`}>
                {isSelected && <Check className="h-3 w-3 stroke-[3] text-white" />}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Name + badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{address.fullName}</span>

                  {address.addressType && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      ADDRESS_TYPE_STYLES[address.addressType] ?? "bg-slate-100 text-slate-600"
                    }`}>
                      {address.addressType}
                    </span>
                  )}

                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Default
                    </span>
                  )}
                </div>

                {/* Address lines */}
                {lines.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {lines.map((line, i) => (
                      <p key={i} className="truncate text-xs text-slate-500">{line}</p>
                    ))}
                  </div>
                )}

                {/* Mobile */}
                {address.mobile && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="h-3 w-3" /> {address.mobile}
                  </p>
                )}
              </div>

              {/* Map pin accent */}
              <MapPin className={`mt-0.5 h-4 w-4 shrink-0 transition ${
                isSelected ? "text-indigo-400" : "text-slate-300"
              }`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}