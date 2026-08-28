"use client";

import Link from "next/link";

import DeliveryStatusTimeline from "@/components/delivery/DeliveryStatusTimeline";
import DeliveryMap from "@/components/maps/DeliveryMap";
import RiderStatusActions from "@/components/rider/RiderStatusActions";
import SectionCard from "@/components/ui/SectionCard";

import type { RiderDelivery } from "@/lib/mock-rider";
import type { DeliveryStatus } from "@/lib/delivery";
import { googleMapsDirectionsUrl } from "@/lib/maps";

type RiderDeliveryDetailsProps = {
  delivery: RiderDelivery;
  status: DeliveryStatus;
  onStatusChange: (status: DeliveryStatus) => Promise<boolean>;
};

export default function RiderDeliveryDetails({
  delivery,
  status,
  onStatusChange,
}: RiderDeliveryDetailsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <SectionCard
          title="Delivery progress"
          description="Update the delivery as you complete each stage."
        >
          <DeliveryStatusTimeline
            currentStatus={status}
          />
        </SectionCard>

        <SectionCard
          title="Update delivery status"
          description="Select the next stage when you complete it."
        >
          <RiderStatusActions
            status={status}
            onStatusChange={onStatusChange}
          />
        </SectionCard>

        <SectionCard title="Delivery information">
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
              value={delivery.customerPhone}
            />

            <DetailItem
              label="Pickup location"
              value={delivery.pickup}
            />

            <DetailItem
              label="Destination"
              value={delivery.destination}
            />

            <DetailItem
              label="Item"
              value={delivery.item}
            />

            <DetailItem
              label="Priority"
              value={
                delivery.priority.charAt(0).toUpperCase() +
                delivery.priority.slice(1)
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Route map" description="Pickup and destination for this assignment.">
          <DeliveryMap
            pickup={delivery.pickup}
            destination={delivery.destination}
            pickupLatitude={delivery.pickupLatitude}
            pickupLongitude={delivery.pickupLongitude}
            destinationLatitude={delivery.destinationLatitude}
            destinationLongitude={delivery.destinationLongitude}
          />
        </SectionCard>
      </div>

      <aside className="space-y-6">
        <SectionCard
          title="Route"
          description="Delivery pickup and destination."
        >
          <RoutePoint
            label="Pickup"
            value={delivery.pickup}
            type="pickup"
          />

          <div className="ml-[7px] h-10 w-px bg-slate-200" />

          <RoutePoint
            label="Destination"
            value={delivery.destination}
            type="destination"
          />
          <a
            href={googleMapsDirectionsUrl(delivery)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Open in Google Maps
          </a>
        </SectionCard>

        <SectionCard title="Customer contact">
          <p className="font-semibold text-slate-900">
            {delivery.customer}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {delivery.customerPhone}
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
        </SectionCard>

        <SectionCard title="Assignment information">
          <div className="space-y-4">
            <DetailItem
              label="Assigned"
              value={delivery.assignedAt ?? "Not recorded"}
            />

            <DetailItem
              label="Last updated"
              value={delivery.updatedAt}
            />
          </div>
        </SectionCard>

        {status === "delivered" && (
          <Link
            href={`/rider/deliveries/${delivery.id}/confirm`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Show QR Confirmation
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
  type: "pickup" | "destination";
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
