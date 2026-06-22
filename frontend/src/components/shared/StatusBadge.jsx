const STATUS_MAP = {
  ACTIVE:     "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE:   "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  BLOCKED:    "bg-slate-100  text-slate-600   ring-1 ring-inset ring-slate-200",
  // Order statuses:
  PENDING:    "bg-amber-50   text-amber-700   ring-1 ring-inset ring-amber-200",
  CONFIRMED:  "bg-blue-50    text-blue-700    ring-1 ring-inset ring-blue-200",
  PROCESSING: "bg-purple-50  text-purple-700  ring-1 ring-inset ring-purple-200",
  PACKED:     "bg-cyan-50    text-cyan-700    ring-1 ring-inset ring-cyan-200",
  SHIPPED:    "bg-sky-50     text-sky-700     ring-1 ring-inset ring-sky-200",
  DELIVERED:  "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  CANCELLED:  "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  // Payment:
  PAID:       "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  FAILED:     "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
};

export default function StatusBadge({ status, icon: Icon }) {
  const cls = STATUS_MAP[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </span>
  );
}