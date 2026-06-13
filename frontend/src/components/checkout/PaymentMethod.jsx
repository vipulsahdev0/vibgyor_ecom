import { Banknote, Smartphone, CreditCard } from "lucide-react";

const METHODS = [
  {
    id:    "cod",
    label: "Cash on Delivery",
    sub:   "Pay when your order arrives",
    Icon:  Banknote,
    accent: "indigo",
  },
  {
    id:    "upi",
    label: "UPI Payment",
    sub:   "GPay, PhonePe, Paytm & more",
    Icon:  Smartphone,
    accent: "violet",
  },
  {
    id:    "card",
    label: "Card Payment",
    sub:   "Visa, Mastercard, RuPay",
    Icon:  CreditCard,
    accent: "sky",
  },
];

const SELECTED_STYLES = {
  indigo: "border-indigo-500 bg-indigo-50 text-indigo-700",
  violet: "border-violet-500 bg-violet-50 text-violet-700",
  sky:    "border-sky-500    bg-sky-50    text-sky-700",
};

const ICON_STYLES = {
  indigo: "bg-indigo-100 text-indigo-600",
  violet: "bg-violet-100 text-violet-600",
  sky:    "bg-sky-100    text-sky-600",
};

export default function PaymentMethod({ selectedMethod, setSelectedMethod }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {METHODS.map(({ id, label, sub, Icon, accent }) => {
        const isSelected = selectedMethod === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedMethod(id)}
            className={`group flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-150 active:scale-95 ${
              isSelected
                ? SELECTED_STYLES[accent]
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isSelected ? ICON_STYLES[accent] : "bg-slate-100 text-slate-500"
            }`}>
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold leading-tight">{label}</p>
              <p className={`mt-0.5 text-[11px] ${isSelected ? "opacity-70" : "text-slate-400"}`}>
                {sub}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}