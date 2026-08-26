import { useMemo, useState } from "react";

import StatusBadge from "@/components/ui/StatusBadge";
import type { DeliveryStatus } from "@/lib/delivery";
import {
  retailerDeliveries,
} from "@/lib/mock-deliveries";

const filterOptions: {
  label: string;
  value: "all" | DeliveryStatus;
}[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Assigned", value: "assigned" },
  { label: "Picked Up", value: "picked_up" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
];

export default function DispatcherDeliveries() {
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"all" | DeliveryStatus>("all");

  const deliveries = useMemo(() => {
    const term = search.trim().toLowerCase();

    return retailerDeliveries.filter((delivery) => {
      const matchesStatus =
        status === "all" ||
        delivery.status === status;

      const matchesSearch =
        !term ||
        delivery.id.toLowerCase().includes(term) ||
        delivery.customer.toLowerCase().includes(term) ||
        delivery.destination.toLowerCase().includes(term) ||
        delivery.rider.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search delivery, customer or rider..."
          className="h-11 w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <selectvalue={status}
          onChange={(event) =>
            setStatus(
              event.target.value as
                | "all"
                | DeliveryStatus
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          {filterOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50">
              <Header>Delivery</Header>
              <Header>Customer</Header>
              <Header>Route</Header>
              <Header>Rider</Header>
              <Header>Status</Header>
              <Header>Last Updated</Header>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {deliveries.map((delivery) => (
              <tr
                key={delivery.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-blue-600">
                    {delivery.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {delivery.createdAt}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {delivery.customer}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {delivery.phone}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {delivery.pickup}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    → {delivery.destination}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {delivery.rider}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    status={delivery.status}size="sm"
                  />
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {delivery.updatedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {deliveries.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-900">
              No deliveries found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
