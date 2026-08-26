"use client";

import { useState } from "react";

import StatusBadge from "@/components/ui/StatusBadge";
import type { DeliveryStatus } from "@/lib/delivery";

type RiderStatusActionsProps = {
  status: DeliveryStatus;
  onStatusChange: (status: DeliveryStatus) => void;
};

const nextStatusMap: Partial<
  Record<DeliveryStatus, DeliveryStatus>
> = {
  assigned: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivered",
};

const buttonLabels: Partial<
  Record<DeliveryStatus, string>
> = {
  assigned: "Mark as Picked Up",
  picked_up: "Start Delivery",
  in_transit: "Mark as Delivered",
};

export default function RiderStatusActions({
  status,
  onStatusChange,
}: RiderStatusActionsProps) {
  const [message, setMessage] = useState("");

  const nextStatus = nextStatusMap[status];

  function updateStatus() {
    if (!nextStatus) {
      return;
    }

    onStatusChange(nextStatus);

    setMessage(
      `Delivery updated to ${formatStatus(nextStatus)}.`
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current status
          </p>

          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>

        {nextStatus && (
          <button
            type="button"
            onClick={updateStatus}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            {buttonLabels[status]}
          </button>
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ Status updated
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {message}
          </p>
        </div>
      )}

      {status === "delivered" && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">
            Customer confirmation required
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            The package has reached its destination. Complete
            the QR confirmation before the delivery is marked
            Completed.
          </p>
        </div>
      )}
    </div>
  );
}

function formatStatus(status: DeliveryStatus) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}
