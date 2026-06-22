import TableSkeleton from "./TableSkeleton";

export default function AdminPageSkeleton({ statCount = 4 }) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <TableSkeleton />
    </section>
  );
}