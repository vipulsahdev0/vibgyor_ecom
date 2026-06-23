import { Banknote, Smartphone, CreditCard, CheckCircle2 } from "lucide-react";

const METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when your order arrives",
    Icon: Banknote,
    accent: "indigo",
  },
  {
    id: "upi",
    label: "UPI Payment",
    sub: "GPay, PhonePe, Paytm & more",
    Icon: Smartphone,
    accent: "indigo",
  },
  {
    id: "card",
    label: "Card Payment",
    sub: "Visa, Mastercard, RuPay",
    Icon: CreditCard,
    accent: "indigo",
  },
];

export default function PaymentMethod({ selectedMethod, setSelectedMethod }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {METHODS.map(({ id, label, sub, Icon }) => {
        const isSelected = selectedMethod === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedMethod(id)}
            aria-pressed={isSelected}
            className={`group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
              isSelected
                ? "border-indigo-300 bg-indigo-50 shadow-sm ring-2 ring-indigo-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                  isSelected
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {isSelected && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-bold leading-tight ${
                  isSelected ? "text-indigo-700" : "text-slate-900"
                }`}
              >
                {label}
              </p>
              <p
                className={`mt-1 text-[11px] leading-5 ${
                  isSelected ? "text-indigo-600/80" : "text-slate-400"
                }`}
              >
                {sub}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}