"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getErrorMessage, type AccountStatus, type UserRole } from "@/lib/api";

export type AdminUser = { id: string; name: string; email: string; role: UserRole; organization: string | null; phone: string | null; accountStatus: AccountStatus; createdAt: string; approvedAt: string | null };

export default function AdminUsers({ approvalsOnly = false }: { approvalsOnly?: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await apiRequest<AdminUser[]>(approvalsOnly ? "/admin/approvals" : "/admin/users")); setMessage(""); }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setLoading(false); }
  }, [approvalsOnly]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function act(user: AdminUser, action: "approve" | "reject" | "suspend" | "activate") {
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${user.name}'s account?`)) return;
    try { await apiRequest(`/admin/users/${user.id}/${action}`, { method: "PATCH" }); await load(); window.dispatchEvent(new Event("reflex:notifications-changed")); }
    catch (error) { setMessage(getErrorMessage(error)); }
  }
  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading platform users…</p>;
  return <div>
    {message && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[860px]"><thead><tr className="border-b border-slate-200 bg-slate-50">{["User", "Requested role", "Business / phone", "Status", "Registered", "Actions"].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="text-sm font-bold text-slate-900">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4 text-sm font-semibold capitalize text-slate-700">{user.role}</td><td className="px-5 py-4 text-sm text-slate-600">{user.organization ?? user.phone ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${user.accountStatus === "active" ? "bg-emerald-50 text-emerald-700" : user.accountStatus === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{user.accountStatus}</span></td><td className="px-5 py-4 text-xs text-slate-500">{user.createdAt}</td><td className="px-5 py-4"><div className="flex gap-2">{user.accountStatus === "pending" && <><button onClick={() => void act(user, "approve")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Approve</button><button onClick={() => void act(user, "reject")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">Reject</button></>}{user.accountStatus === "active" && user.role !== "admin" && <button onClick={() => void act(user, "suspend")} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Suspend</button>}{["suspended", "rejected"].includes(user.accountStatus) && <button onClick={() => void act(user, "activate")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Activate</button>}</div></td></tr>)}</tbody></table>{!users.length && <p className="px-6 py-12 text-center text-sm text-slate-500">{approvalsOnly ? "No pending approval requests" : "No users or activity yet"}</p>}</div>
  </div>;
}
