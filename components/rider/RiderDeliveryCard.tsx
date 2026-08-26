import Link from "next/link";

import StatusBadge from "@/components/ui/StatusBadge";
import type { RiderDelivery } from "@/lib/mock-rider";

type RiderDeliveryCardProps = {
  delivery: RiderDelivery;
};

export default function RiderDeliveryCard({
  delivery,
}: RiderDeliveryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Delivery
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {delivery.id}
          </h2>
        </div>

        <StatusBadge
          status={delivery.status}
          size="sm"
        />
      </div>

      <div className="mt-5 grid gap-4">
        <InfoItem
          label="Customer"
          value={delivery.customer}
        />

        <InfoItem
          label="Pickup"
          value={delivery.pickup}
        />

        <InfoItem
          label="Destination"
          value={delivery.destination}
        />

        <InfoItem
          label="Item"
          value={delivery.item}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Priority
          </p>

          <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
            {delivery.priority}
          </p>
        </div>

        <Link
          href={`/rider/deliveries/${delivery.id}`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          View Delivery
        </Link>
      </div>
    </article>
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

      <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}
