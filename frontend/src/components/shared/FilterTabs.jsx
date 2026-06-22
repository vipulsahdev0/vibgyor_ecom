export default function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            value === opt
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}