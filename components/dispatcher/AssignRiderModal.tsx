"use client";

import type {
  DispatcherRequest,
  Rider,
} from "@/lib/mock-dispatcher";

type AssignRiderModalProps = {
  request: DispatcherRequest | null;
  riders: Rider[];
  onClose: () => void;
  onAssign: (rider: Rider) => void;
};

export default function AssignRiderModal({
  request,
  riders,
  onClose,
  onAssign,
}: AssignRiderModalProps) {
  if (!request) {
    return null;
  }

  const availableRiders = riders.filter(
    (rider) => rider.available
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
      <button
        type="button"
        aria-label="Close assign rider dialog"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-rider-title"
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {request.id}
            </p>

            <h2
              id="assign-rider-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Assign a rider
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an available rider for this delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Customer"
              value={request.customer}
            />

            <InfoItem
              label="Destination"
              value={request.destination}
            />

            <InfoItem
              label="Pickup"
              value={request.pickup}
            />

            <InfoItem
              label="Item"
              value={request.item}
            />
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available riders
          </p>

          <div className="space-y-3">
            {availableRiders.map((rider) => (
              <div
                key={rider.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {getInitials(rider.name)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {rider.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {rider.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Active
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {rider.activeDeliveries} deliveries
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAssign(rider)} className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
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
