import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users as UsersIcon, RefreshCw, AlertCircle,
  Search, Loader2, ShieldCheck, UserX, UserCheck,
  Mail, Phone, Filter,
} from "lucide-react";
import { getAllUsers, updateUserStatus } from "../../api/userApi";

const STATUS_STYLES = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-200",
  BLOCKED:  "bg-slate-100  text-slate-600   ring-1 ring-inset ring-slate-200",
};

const ROLE_STYLES = {
  ADMIN: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  USER:  "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
};

function getInitials(u) {
  const n = u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(" ");
  return n ? n.split(" ").slice(0,2).map(p => p[0].toUpperCase()).join("") : "U";
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-slate-100" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-16 rounded-full bg-slate-100" />
            <div className="h-6 w-16 rounded-full bg-slate-100" />
            <div className="h-8 w-24 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const FILTERS = ["ALL", "ACTIVE", "INACTIVE", "ADMIN", "USER"];

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("ALL");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
      toast.error("Failed to load users");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatus = async (userId, nextStatus) => {
    try {
      setUpdatingId(userId);
      await updateUserStatus(userId, nextStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      toast.success(`User ${nextStatus === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally { setUpdatingId(null); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      [u.fullName, u.email, u.mobile].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === "ALL"   ? true :
      filter === "ADMIN" ? u.role?.includes("ADMIN") :
      filter === "USER"  ? !u.role?.includes("ADMIN") :
      u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage platform users, roles, and account status.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            {users.length} total
          </span>
          <button onClick={fetchUsers} disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, email, mobile…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button onClick={fetchUsers}
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <TableSkeleton />}

      {/* Empty */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {search || filter !== "ALL" ? "No users match your filters" : "No users found"}
            </p>
            {(search || filter !== "ALL") && (
              <button onClick={() => { setSearch(""); setFilter("ALL"); }}
                className="mt-2 text-xs text-indigo-600 hover:underline">Clear filters</button>
            )}
          </div>
        </div>
      )}

      {/* Desktop table */}
      {!loading && filteredUsers.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["User","Mobile","Role","Status","Action"].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 4 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => {
                  const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                  const isUpdating = updatingId === user.id;
                  const initials   = getInitials(user);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.fullName || "Unnamed"}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{user.mobile || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                          <ShieldCheck className="h-3 w-3" />
                          {user.role?.replace("ROLE_", "")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[user.status] ?? STATUS_STYLES.BLOCKED}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button type="button" disabled={isUpdating}
                          onClick={() => handleStatus(user.id, nextStatus)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                            user.status === "ACTIVE"
                              ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}>
                          {isUpdating
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating</>
                            : user.status === "ACTIVE"
                              ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                              : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                          }
                        </button>
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
              const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              const isUpdating = updatingId === user.id;
              return (
                <article key={user.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {getInitials(user)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.fullName || "Unnamed"}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="h-3 w-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[user.status] ?? STATUS_STYLES.BLOCKED}`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {user.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{user.mobile}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {user.role?.replace("ROLE_", "")}
                    </span>
                  </div>

                  <button type="button" disabled={isUpdating}
                    onClick={() => handleStatus(user.id, nextStatus)}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition active:scale-95 disabled:opacity-60 ${
                      user.status === "ACTIVE"
                        ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}>
                    {isUpdating
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                      : user.status === "ACTIVE"
                        ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                        : <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                    }
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}