export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-100" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>
            {Array.from({ length: cols - 2 }).map((_, j) => (
              <div key={j} className="h-5 w-16 rounded-full bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}