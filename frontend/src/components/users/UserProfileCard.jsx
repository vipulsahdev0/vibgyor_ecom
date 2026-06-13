import { Phone, ShieldCheck, MapPin, ShoppingBag, Mail, User } from "lucide-react";

const STATUS_STYLES = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  INACTIVE: "bg-slate-100  text-slate-600   ring-1 ring-slate-200",
  BLOCKED:  "bg-rose-50    text-rose-700    ring-1 ring-rose-200",
};

const ROLE_STYLES = {
  ADMIN: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  USER:  "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
};

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

function getInitials(user) {
  const full =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  if (!full) return "U";
  return full.split(" ").filter(Boolean).slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase()).join("");
}

function formatLabel(value) {
  if (!value) return "—";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
}

function getAvatarGradient(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] || AVATAR_GRADIENTS[0];
}

const STATS = [
  { label: "Orders",           key: "orderCount",   icon: ShoppingBag },
  { label: "Saved Addresses",  key: "addressCount", icon: MapPin },
];

export default function UserProfileCard({ user }) {
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "User";

  const initials    = getInitials(user);
  const gradient    = getAvatarGradient(displayName);
  const statusClass = STATUS_STYLES[user?.status] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  const roleClass   = ROLE_STYLES[user?.role]     ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

      {/* Banner */}
      <div className={`h-20 bg-gradient-to-r ${gradient}`} />

      {/* Content */}
      <div className="-mt-10 px-5 pb-6 sm:px-6">

        {/* Avatar + Name row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-bold text-white shadow-md ring-4 ring-white`}>
              {initials}
            </div>

            {/* Name + email */}
            <div className="pb-1">
              <h2 className="text-lg font-bold leading-tight text-slate-900">{displayName}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="break-all">{user?.email || "Email not available"}</span>
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pb-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${roleClass}`}>
              <ShieldCheck className="h-3 w-3" /> {formatLabel(user?.role)}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
              {formatLabel(user?.status)}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* Mobile */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mobile</p>
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.mobile || "—"}
              </p>
            </div>
          </div>

          {/* Stats */}
          {STATS.map(({ label, key, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-900">{user?.[key] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}