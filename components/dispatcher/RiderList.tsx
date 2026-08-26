"use client";

import { useMemo, useState } from "react";
import {
  reflexRiders,
} from "@/lib/mock-dispatcher";

export default function RiderList() {
  const [search, setSearch] = useState("");

  const riders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reflexRiders.filter((rider) => {
      return (
        !term ||
        rider.name.toLowerCase().includes(term) ||
        rider.phone.toLowerCase().includes(term) ||
        rider.id.toLowerCase().includes(term)
      );
    });
  }, [search]);

  return (
    <div>
      <div className="border-b border-slate-100 pb-5">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search riders..."
          className="h-11 w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {riders.map((rider) => (
          <article
            key={rider.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {getInitials(rider.name)}
                </div>

                <div><h3 className="font-semibold text-slate-950">
                    {rider.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {rider.id}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  rider.available
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {rider.available
                  ? "Available"
                  : "Busy"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <Info
                label="Phone"
                value={rider.phone}
              />

              <Info
                label="Active Deliveries"
                value={String(
                  rider.activeDeliveries
                )}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Info({
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

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
