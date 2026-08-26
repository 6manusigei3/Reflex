"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import StatusBadge from "@/components/ui/StatusBadge";
import type {
  DeliveryStatus,
} from "@/lib/delivery";
import type {
  RetailerDelivery,
} from "@/lib/mock-deliveries";

type DeliveryListProps = {
  deliveries: RetailerDelivery[];
};

const filters: {
  label: string;
  value: "all" | DeliveryStatus;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Assigned",
    value: "assigned",
  },
  {
    label: "Picked Up",
    value: "picked_up",
  },
  {
    label: "In Transit",
    value: "in_transit",
  },
  {
    label: "Delivered",
    value: "delivered",
  },
  {
    label: "Completed",
    value: "completed",
  },
];

export default function DeliveryList({
  deliveries,
}: DeliveryListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"all" | DeliveryStatus>("all");

  const filteredDeliveries = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesStatus =
        status === "all" ||
        delivery.status === status;

      const matchesSearch =
        !normalizedSearch ||
        delivery.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        delivery.customer
          .toLowerCase()
          .includes(normalizedSearch) ||
        delivery.destination
          .toLowerCase()
          .includes(normalizedSearch) ||
        delivery.rider
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [deliveries, search, status]);

  return (<div>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              strokeWidth="1.8"
            />

            <path
              d="m20 20-4-4"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search delivery, customer or rider..."
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as
                | "all"
                | DeliveryStatus
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          {filters.map((filter) => (
            <option
              key={filter.value}
              value={filter.value}
            >
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <p className="mb-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredDeliveries.length}
          </span>{" "}
          deliveries
          </p>

        {filteredDeliveries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
            <p className="font-semibold text-slate-900">
              No deliveries found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <Header>
                      Delivery
                    </Header>

                    <Header>
                      Customer
                    </Header>

                    <Header>
                      Destination
                    </Header>

                    <Header>
                      Rider
                    </Header>

                    <Header>
                      Priority
                    </Header>

                    <Header>
                      Status
                    </Header>

                    <Header align="right">
                      Action
                    </Header>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDeliveries.map(
                    (delivery) => (
                      <tr
                        key={delivery.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-950">
                            {delivery.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {delivery.createdAt}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {delivery.customer}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {delivery.phone}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {delivery.destination}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {delivery.rider}
                        </td>

                        <td className="px-5 py-4">
                          <PriorityBadge
                            priority={
                              delivery.priority
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={delivery.status}
                            size="sm"
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/retailer/deliveries/${delivery.id}`}
                            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
              {filteredDeliveries.map(
                (delivery) => (
                  <Link
                    key={delivery.id}
                    href={`/retailer/deliveries/${delivery.id}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition active:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {delivery.id}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {delivery.customer}
                        </p>
                      </div>

                      <StatusBadge
                        status={delivery.status}
                        size="sm"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm">
                      <MobileItem
                        label="Destination"
                        value={
                          delivery.destination
                        }
                      />

                      <MobileItem
                        label="Rider"
                        value={delivery.rider}
                      />
                    </div>
                  </Link>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Header({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
  align === "right"
    ? "text-right"
    : "text-left"
}`}
    >
      {children}
    </th>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: RetailerDelivery["priority"];
}) {
  const styles = {
    normal:
      "bg-slate-100 text-slate-600",
    high:
      "bg-orange-50 text-orange-700",
    urgent:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function MobileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-slate-700">
        {value}
      </p>
    </div>
  );
}
