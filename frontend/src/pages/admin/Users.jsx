import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users as UsersIcon, RefreshCw, Search, Loader2,
  ShieldCheck, UserX, UserCheck, Mail, Phone, Filter, Trash2,
} from "lucide-react";
import { getAllUsers, updateUserStatus, softDeleteUser } from "../../api/adminApi";
import TableSkeleton from "../../components/shared/TableSkeleton";
import ErrorBanner from "../../components/shared/ErrorBanner";
import StatCard from "../../components/shared/StatCard";

// ─── Style maps — aligned with Status & UserRole enums from backend ───────────
const STATUS_STYLES = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  BLOCKED:  "bg-slate-100  text-slate-600   ring-1 ring-inset ring-slate-200",
  DELETED:  "bg-slate-100  text-slate-400   ring-1 ring-inset ring-slate-200",
};

const ROLE_STYLES = {
  ADMIN: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  USER:  "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
};

// Backend UserRole enum: USER | ADMIN
const ROLE_FILTERS   = ["ALL", "USER", "ADMIN"];
// Backend Status enum: ACTIVE | INACTIVE | BLOCKED | DELETED
const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];

function getInitials(u) {
  const n = u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(" ");
  return n ? n.split(" ").slice(0, 2).map(p => p[0].toUpperCase()).join("") : "U";
}

function getDisplayName(u) {
  return u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "Unknown User";
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter]     = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch — GET /api/admin/users?role=...&status=... ─────────────────────
  const fetchUsers = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true); else setRefreshing(true);
      setError("");
      const params = {};
      if (roleFilter   !== "ALL") params.role   = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await getAllUsers(params);
      const data = res?.data ?? res;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
      toast.error("Failed to load users");
    } finally { setLoading(false); setRefreshing(false); }
  }, [roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(true); }, [fetchUsers]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.status === "ACTIVE").length,
    inactive: users.filter(u => u.status === "INACTIVE" || u.status === "BLOCKED").length,
    admins:   users.filter(u => u.role === "ADMIN").length,
  }), [users]);

  // ── Client-side search on top of server-filtered data ───────────────────
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      getDisplayName(u).toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.mobile?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  }, [users, search]);

  // ── Update user status — PATCH /api/admin/users/{userId}/status ──────────
  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === "ACTIVE" ? "activated" : newStatus.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update user status");
    } finally { setUpdatingId(null); }
  };

  // ── Soft delete — DELETE /api/admin/users/{userId} ───────────────────────
  const handleSoftDelete = async (user) => {
    if (!window.confirm(`Soft-delete user "${getDisplayName(user)}"? This sets status to DELETED.`)) return;
    setUpdatingId(user.id);
    try {
      await softDeleteUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "DELETED" } : u));
      toast.success("User soft-deleted");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete user");
    } finally { setUpdatingId(null); }
  };

  if (loading) return (
    <section className="space-y-6">
      <div className="h-7 w-36 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <TableSkeleton />
    </section>
  );

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage registered users, roles, and account statuses.</p>
        </div>
        <button onClick={() => fetchUsers(false)} disabled={refreshing}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users"  value={stats.total}    accent="slate"   Icon={UsersIcon}   />
        <StatCard title="Active"       value={stats.active}   accent="emerald" Icon={UserCheck}   />
        <StatCard title="Inactive"     value={stats.inactive} accent="rose"    Icon={UserX}       />
        <StatCard title="Admins"       value={stats.admins}   accent="purple"  Icon={ShieldCheck} />
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} />}

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name, email, or mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-2">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            {ROLE_FILTERS.map(r => <option key={r} value={r}>{r === "ALL" ? "All Roles" : r}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
          </select>
        </div>
      </div>

      {/* Results meta */}
      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of{" "}
        <span className="font-bold text-slate-900">{users.length}</span> users
      </p>

      {/* Empty */}
      {!filteredUsers.length && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            {search || roleFilter !== "ALL" || statusFilter !== "ALL" ? "No users match your filters" : "No users found"}
          </p>
          {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <button onClick={() => { setSearch(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}
              className="text-xs text-indigo-600 hover:underline">Clear filters</button>
          )}
        </div>
      )}

      {/* Desktop table */}
      {filteredUsers.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["User", "Email", "Mobile", "Role", "Status", "Actions"].map((h, i) => (
                    <th key={h}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 5 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => {
                  const isUpdating = updatingId === user.id;
                  const isDeleted  = user.status === "DELETED";
                  return (
                    <tr key={user.id} className={`group transition-colors hover:bg-slate-50/70 ${isDeleted ? "opacity-50" : ""}`}>
                      {/* User avatar + name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {getInitials(user)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{getDisplayName(user)}</p>
                            <p className="text-[11px] text-slate-400">ID #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {user.email || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {user.mobile || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[user.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdating
                            ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            : (
                              <>
                                {/* Toggle ACTIVE / INACTIVE */}
                                {!isDeleted && user.status !== "DELETED" && (
                                  <button
                                    onClick={() => handleStatusChange(user.id, user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                                      user.status === "ACTIVE"
                                        ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}>
                                    {user.status === "ACTIVE"
                                      ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                                      : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                                    }
                                  </button>
                                )}
                                {/* Soft delete */}
                                {!isDeleted && (
                                  <button
                                    onClick={() => handleSoftDelete(user)}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95">
                                    <Trash2 className="h-3.5 w-3.5 text-slate-400" /> Delete
                                  </button>
                                )}
                              </>
                            )
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredUsers.map(user => {
              const isUpdating = updatingId === user.id;
              const isDeleted  = user.status === "DELETED";
              return (
                <article key={user.id} className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${isDeleted ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {getInitials(user)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{getDisplayName(user)}</p>
                        <p className="text-[11px] text-slate-400">ID #{user.id}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[user.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />{user.email || "—"}
                    </div>
                    {user.mobile && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />{user.mobile}
                      </div>
                    )}
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {user.role}
                    </span>
                  </div>

                  {!isDeleted && (
                    <div className="mt-3 flex gap-2">
                      {isUpdating
                        ? <div className="flex flex-1 items-center justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-indigo-500" /></div>
                        : (
                          <>
                            <button
                              onClick={() => handleStatusChange(user.id, user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                                user.status === "ACTIVE"
                                  ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}>
                              {user.status === "ACTIVE"
                                ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                                : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                              }
                            </button>
                            <button
                              onClick={() => handleSoftDelete(user)}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </>
                        )
                      }
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}