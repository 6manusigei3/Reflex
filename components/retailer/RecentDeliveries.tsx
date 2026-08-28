"use client";

import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  retailerDeliveries,
  type RetailerDelivery,
} from "@/lib/mock-deliveries";
import { useApiList } from "@/lib/use-api-data";

export default function RecentDeliveries() {
  const { data, loading } = useApiList<RetailerDelivery>(
    "/deliveries",
    retailerDeliveries
  );

  if (loading) {
    return <div className="py-12 text-center text-sm font-semibold text-slate-500">Loading deliveries…</div>;
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No deliveries yet"
        description="Create your first delivery request and track it here from assignment through confirmation."
        action={<Link href="/retailer/new-delivery" className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">Create your first delivery</Link>}
      />
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivery
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Destination
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rider
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Created
            </th>

            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.slice(0, 5).map((delivery) => (
            <tr
              key={delivery.id}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="px-5 py-4">
                <Link
                  href={`/retailer/deliveries/${delivery.id}`}
                  className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  {delivery.id}
                </Link>
              </td>

              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {delivery.customer}
                </p>
              </td>

              <td className="px-5 py-4">
                <p className="text-sm text-slate-600">
                  {delivery.destination}
                </p>
              </td>

              <td className="px-5 py-4">
                <p
                  className={`text-sm ${
                    !delivery.rider || delivery.rider === "Not assigned"
                      ? "italic text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {delivery.rider ?? "Not assigned"}
                </p>
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={delivery.status}
                  size="sm"
                />
</td>

              <td className="px-5 py-4">
                <p className="text-sm text-slate-500">
                  {delivery.createdAt}
                </p>
              </td>

              <td className="px-5 py-4 text-right">
                <Link
                  href={`/retailer/deliveries/${delivery.id}`}
                  className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
