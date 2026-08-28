"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { useApiList, useApiResource } from "@/lib/use-api-data";

type Stats = { totalRetailers: number; totalRiders: number; activeRiders: number; totalDispatchers: number; pendingApprovals: number; activeDeliveries: number; completedDeliveries: number; totalUsers: number };
type Audit = { id: number; actorName: string | null; action: string; entityType: string; entityId: string; createdAt: string };

export default function AdminOverview() {
  const { data: stats, error } = useApiResource<Stats>("/admin/stats", { totalRetailers: 0, totalRiders: 0, activeRiders: 0, totalDispatchers: 0, pendingApprovals: 0, activeDeliveries: 0, completedDeliveries: 0, totalUsers: 0 });
  const { data: activity } = useApiList<Audit>("/admin/audit?limit=6", []);
  return <div>
    {error && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Platform statistics are temporarily unavailable.</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Platform users" value={stats.totalUsers} description={`${stats.pendingApprovals} awaiting review`} />
      <StatCard title="Retailers" value={stats.totalRetailers} description="Registered businesses" />
      <StatCard title="Riders" value={stats.totalRiders} description={`${stats.activeRiders} available`} />
      <StatCard title="Dispatchers" value={stats.totalDispatchers} description="Operations coordinators" />
      <StatCard title="Pending approvals" value={stats.pendingApprovals} description="Require Admin action" />
      <StatCard title="Active deliveries" value={stats.activeDeliveries} description="Across the platform" />
      <StatCard title="Completed" value={stats.completedDeliveries} description="Confirmed deliveries" />
    </div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-950">Recent platform activity</h2><p className="mt-1 text-sm text-slate-500">Account and delivery governance events.</p></div><Link href="/admin/activity" className="text-sm font-bold text-blue-600">View all</Link></div>
      {activity.length ? <div className="mt-5 divide-y divide-slate-100">{activity.map((event) => <div key={event.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{event.action.replaceAll(".", " · ")}</p><p className="mt-1 text-xs text-slate-500">{event.actorName ?? "Public recipient"} · {event.entityType} {event.entityId}</p></div><span className="text-xs text-slate-400">{event.createdAt}</span></div>)}</div> : <p className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No users or activity yet</p>}
    </section>
  </div>;
}
