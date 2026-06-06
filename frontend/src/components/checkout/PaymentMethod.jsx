const methods = [
  { id: "cod", label: "Cash on Delivery", icon: "💳" },
  { id: "upi", label: "UPI Payment", icon: "📱" },
  { id: "card", label: "Card Payment", icon: "💰" },
];

export default function PaymentMethod({
  selectedMethod,
  setSelectedMethod,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => setSelectedMethod(method.id)}
          className={`p-5 rounded-2xl border font-semibold transition-all text-center ${selectedMethod === method.id
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
            }`}
        >
          <div className="text-2xl mb-2">{method.icon}</div>
          <div>{method.label}</div>
        </button>
      ))}
    </div>
  );
}