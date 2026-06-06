const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  BLOCKED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const ROLE_STYLES = {
  ADMIN: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  USER: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
};

function getInitials(user) {
  const fullName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  if (!fullName) return "U";

  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatLabel(value) {
  if (!value) return "Not available";
  return String(value).charAt(0) + String(value).slice(1).toLowerCase();
}

export default function UserProfileCard({ user }) {
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "User";

  const statusClass =
    STATUS_STYLES[user?.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  const roleClass =
    ROLE_STYLES[user?.role] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500" />

      <div className="px-6 sm:px-8 pb-8 -mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-md ring-4 ring-white text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {getInitials(user)}
            </div>

            <div className="pt-6 sm:pt-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                {displayName}
              </h2>
              <p className="text-slate-500 mt-1 break-all">
                {user?.email || "Email not available"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleClass}`}
            >
              {formatLabel(user?.role)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              {formatLabel(user?.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Mobile</p>
            <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900 break-all">
              {user?.mobile || "Not available"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">
              {formatLabel(user?.role)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Saved Addresses</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {user?.addressCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500">Orders</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {user?.orderCount ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}