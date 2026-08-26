import Link from "next/link";

import DeliveryStatusTimeline from "@/components/delivery/DeliveryStatusTimeline";
import RiderStatusActions from "@/components/rider/RiderStatusActions";
import SectionCard from "@/components/ui/SectionCard";

import type {
  RiderDelivery,
} from "@/lib/mock-rider";

type RiderDeliveryDetailsProps = {
  delivery: RiderDelivery;
};

export default function RiderDeliveryDetails({
  delivery,
}: RiderDeliveryDetailsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <SectionCard
          title="Delivery progress"
          description="Update the delivery as you complete each stage."
        >
          <DeliveryStatusTimeline
            currentStatus={
              delivery.status
            }
          />
        </SectionCard>

        <SectionCard
          title="Update delivery status"
          description="Use the action below when you complete the next delivery stage."
        >
          <RiderStatusActions
            initialStatus={
              delivery.status
            }
          />
        </SectionCard>

        <SectionCard
          title="Delivery information"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="Delivery ID"
              value={delivery.id}
            />

            <DetailItem
              label="Retailer"
              value={delivery.retailer}
            />

            <DetailItem
              label="Customer"
              value={delivery.customer}
            />

            <DetailItem
              label="Customer phone"
              value={
                delivery.customerPhone
              }
            />

            <DetailItem
              label="Pickup location"
              value={delivery.pickup}
            />

            <DetailItem
              label="Destination"
              value={
                delivery.destination
              }
            />

            <DetailItem
              label="Item"
              value={delivery.item}
            />

            <DetailItem
              label="Priority"
              value={
                delivery.priority
                  .charAt(0)
                  .toUpperCase() +
                delivery.priority.slice(1)
              }
            />
          </div>
        </SectionCard>
      </div>

      <aside className="space-y-6">
        <SectionCard
          title="Route"
          description="Delivery pickup and destination."
        >
          <div className="relative">
            <RoutePoint
              label="Pickup"
              value={delivery.pickup}
              type="pickup"
            />

            <div className="ml-[7px] h-10 w-px bg-slate-200" />

            <RoutePoint
              label="Destination"
              value={
                delivery.destination
              }
              type="destination"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Customer contact"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {delivery.customer}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {
                delivery.customerPhone
              }
            </p>

            <a
              href={`tel:${delivery.customerPhone.replace(
                /\s/g,
                ""
              )}`}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Call Customer
            </a>
          </div>
        </SectionCard>

        <SectionCard
          title="Assignment information"
        >
          <div className="space-y-4">
            <DetailItem
              label="Assigned"
              value={
                delivery.assignedAt
              }
            />

            <DetailItem
              label="Last updated"
              value={
                delivery.updatedAt
              }
            />
          </div>
        </SectionCard>

        {delivery.status === "delivered" && (
          <Link
            href={`/rider/deliveries/${delivery.id}/confirm`}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Confirm Delivery
          </Link>
        )}
      </aside>
    </div>
  );
}

function DetailItem({
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

      <p className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function RoutePoint({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type:
    | "pickup"
    | "destination";
}) {
  return (
    <div className="flex gap-4">
      <span
        className={`mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-white ${
          type === "pickup"
            ? "bg-blue-500"
            : "bg-emerald-500"
        }`}
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
