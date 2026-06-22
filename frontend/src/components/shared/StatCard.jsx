// src/components/shared/StatCard.jsx
import { AlertTriangle } from "lucide-react";

const ACCENT_MAP = {
  slate:   { bg: "bg-slate-50",   icon: "text-slate-500",   val: "text-slate-900"   },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", val: "text-emerald-700" },
  rose:    { bg: "bg-rose-50",    icon: "text-rose-500",    val: "text-rose-700"    },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-500",  val: "text-indigo-700"  },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-500",   val: "text-amber-700"   },
  pink:    { bg: "bg-pink-50",    icon: "text-pink-500",    val: "text-pink-600"    },
};

export default function StatCard({ title, value, Icon, accent = "slate", sub, warn }) {
  const c = ACCENT_MAP[accent] ?? ACCENT_MAP.slate;
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${warn && value > 0 ? "border-amber-200" : "border-slate-100"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 text-2xl font-black tabular-nums sm:text-3xl ${c.val}`}>{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
          {warn && value > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-600">
              <AlertTriangle className="h-3 w-3" /> Needs restocking
            </p>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-4.5 w-4.5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}