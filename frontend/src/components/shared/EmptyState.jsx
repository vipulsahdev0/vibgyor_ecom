export default function EmptyState({ icon: Icon, message, submessage, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
      {Icon && <Icon className="h-8 w-8 text-slate-300" />}
      <div>
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        {submessage && <p className="mt-1 text-xs text-slate-400">{submessage}</p>}
        {actionLabel && onAction && (
          <button onClick={onAction}
            className="mt-2 text-xs text-indigo-600 hover:underline">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}