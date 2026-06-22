import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <span className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />{message}
      </span>
      {onRetry && (
        <button onClick={onRetry}
          className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
          Retry
        </button>
      )}
    </div>
  );
}