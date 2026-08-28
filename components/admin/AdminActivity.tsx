"use client";

import { useApiList } from "@/lib/use-api-data";
type Audit = { id: number; actorName: string | null; action: string; entityType: string; entityId: string; metadata: Record<string, unknown>; createdAt: string };
export default function AdminActivity() {
  const { data, error } = useApiList<Audit>("/admin/audit", []);
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">{error && <p className="m-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Audit activity is unavailable.</p>}{data.length ? <div className="divide-y divide-slate-100">{data.map((event) => <article key={event.id} className="grid gap-3 p-5 md:grid-cols-[1fr_180px]"><div><p className="text-sm font-bold text-slate-900">{event.action.replaceAll(".", " · ")}</p><p className="mt-1 text-sm text-slate-500">{event.actorName ?? "Public recipient"} affected {event.entityType} <span className="font-mono text-xs">{event.entityId}</span></p>{Object.keys(event.metadata).length > 0 && <p className="mt-2 text-xs text-slate-400">{Object.entries(event.metadata).map(([key, value]) => `${key}: ${String(value)}`).join(" · ")}</p>}</div><time className="text-xs text-slate-400 md:text-right">{event.createdAt}</time></article>)}</div> : <p className="p-12 text-center text-sm text-slate-500">No users or activity yet</p>}</section>;
}
