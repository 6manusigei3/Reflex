"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { retailerDeliveries, type RetailerDelivery } from "@/lib/mock-deliveries";
import { useApiList } from "@/lib/use-api-data";

export default function RetailerHistory() {
  const { data } = useApiList<RetailerDelivery>("/deliveries", retailerDeliveries);
  const completed = data.filter((item) => ["delivered", "completed", "failed", "cancelled"].includes(item.status));
  return (
    <div className="grid gap-3">
      {completed.map((item) => (
        <Link key={item.id} href={`/retailer/deliveries/${item.id}`} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-bold text-blue-600">{item.id}</p><p className="mt-1 text-sm font-semibold text-slate-800">{item.customer}</p><p className="mt-1 text-xs text-slate-500">{item.destination} • {item.updatedAt}</p></div>
          <StatusBadge status={item.status} size="sm" />
        </Link>
      ))}
    </div>
  );
}
