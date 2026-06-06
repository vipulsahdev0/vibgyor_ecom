import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getAllUsers, updateUserStatus } from "../../api/userApi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatus = async (userId, nextStatus) => {
    try {
      setUpdatingId(userId);

      await updateUserStatus(userId, nextStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, status: nextStatus }
            : user
        )
      );

      toast.success(`User ${nextStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClasses = (status) => {
    return status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  };

  const getActionClasses = (status, disabled) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
    const tone =
      status === "ACTIVE"
        ? "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500"
        : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500";

    return `${base} ${tone} ${disabled ? "" : ""}`;
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <div className="h-9 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-64 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Users
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage platform users, monitor account roles, and control active status.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Total Users: {users.length}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            onClick={fetchUsers}
            className="inline-flex w-fit items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!users.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No users found</h2>
          <p className="mt-2 text-sm text-slate-500">
            There are no users available to display right now.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Mobile
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const nextStatus =
                      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                    const isUpdating = updatingId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {user.fullName || "Unnamed User"}
                            </span>
                            <span className="text-sm text-slate-500">
                              {user.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.mobile || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatus(user.id, nextStatus)}
                            className={getActionClasses(user.status, isUpdating)}
                          >
                            {isUpdating
                              ? "Updating..."
                              : user.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {users.map((user) => {
              const nextStatus =
                user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              const isUpdating = updatingId === user.id;

              return (
                <article
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        {user.fullName || "Unnamed User"}
                      </h2>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClasses(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Mobile
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-slate-800">
                        {user.mobile || "—"}
                      </dd>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Role
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-slate-800">
                        {user.role}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatus(user.id, nextStatus)}
                      className={`w-full ${getActionClasses(user.status, isUpdating)}`}
                    >
                      {isUpdating
                        ? "Updating..."
                        : user.status === "ACTIVE"
                        ? "Deactivate User"
                        : "Activate User"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}