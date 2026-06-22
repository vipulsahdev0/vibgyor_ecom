import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";

export default function StatusToggleButton({ status, loading, onClick, className = "" }) {
  const isActive = status === "ACTIVE";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold
        transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60
        ${isActive
          ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        } ${className}`}
    >
      {loading
        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating</>
        : isActive
          ? <><ToggleLeft className="h-3.5 w-3.5" /> Deactivate</>
          : <><ToggleRight className="h-3.5 w-3.5" /> Activate</>
      }
    </button>
  );
}
