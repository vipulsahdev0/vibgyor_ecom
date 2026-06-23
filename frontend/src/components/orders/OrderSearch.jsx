import { Search } from "lucide-react";

export default function OrderSearch({
  value,
  onChange,
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search order number..."
        className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}