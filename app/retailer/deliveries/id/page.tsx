import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import DeliveryStatusTimeline from "@/components/delivery/DeliveryStatusTimeline";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";

import {
  retailerDeliveries,
} from "@/lib/mock-deliveries";

type DeliveryDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeliveryDetailsPage({
  params,
}: DeliveryDetailsPageProps) {
  const { id } = await params;

  const delivery =
    retailerDeliveries.find(
      (item) => item.id === id
    );

  if (!delivery) {
    notFound();
  }

  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <Link
        href="/retailer/deliveries"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        ← Back to deliveries
      </Link>

      <PageHeader
        eyebrow="Delivery details"
        title={delivery.id}
        description={`Created ${delivery.createdAt}`}
        action={
          <StatusBadge
            status={delivery.status}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard
            title="Delivery progress"
            description="Follow the delivery from request creation to final confirmation."
          >
            <DeliveryStatusTimeline
              currentStatus={
                delivery.status
              }
            />
          </SectionCard>

          <SectionCard
            title="Delivery information"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItemimport Link from "next/link";
import { notFound } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import DeliveryStatusTimeline from "@/components/delivery/DeliveryStatusTimeline";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";

import {
  retailerDeliveries,
} from "@/lib/mock-deliveries";

type DeliveryDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeliveryDetailsPage({
  params,
}: DeliveryDetailsPageProps) {
  const { id } = await params;

  const delivery =
    retailerDeliveries.find(
      (item) => item.id === id
    );

  if (!delivery) {
    notFound();
  }

  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <Link
        href="/retailer/deliveries"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        ← Back to deliveries
      </Link>

      <PageHeader
        eyebrow="Delivery details"
        title={delivery.id}
        description={`Created ${delivery.createdAt}`}
        action={
          <StatusBadge
            status={delivery.status}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard
            title="Delivery progress"
            description="Follow the delivery from request creation to final confirmation."
          >
            <DeliveryStatusTimeline
              currentStatus={
                delivery.status
              }
            />
          </SectionCard>

          <SectionCard
            title="Delivery information"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem
label="Customer"
                value={delivery.customer}
              />

              <DetailItem
                label="Customer phone"
                value={delivery.phone}
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

          <SectionCard
            title="Delivery activity"
            description="Important events recorded during this delivery."
          >
            <DeliveryActivity
              status={delivery.status}
              createdAt={
                delivery.createdAt
              }
              updatedAt={
                delivery.updatedAt
              }
              rider={delivery.rider}
            />
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard
            title="Assigned rider"
          >
            {delivery.rider ===
            "Not assigned" ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                <p className="font-semibold text-slate-800">
                  No rider assigned
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The dispatcher will assign an
                  available rider to this
                  request.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {getInitials(
                      delivery.rider)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {delivery.rider}
                    </p>

                    <p className="text-sm text-slate-500">
                      Reflex Rider
                    </p>
                  </div>
                </div>

                {delivery.riderPhone && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Contact
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {
                        delivery.riderPhone
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Delivery confirmation"
          >
            <ConfirmationStatus
              status={
                delivery.confirmationStatus
              }
            />
          </SectionCard>

          <SectionCard
            title="Record information"
          >
            <div className="space-y-4">
              <DetailItem
                label="Created"
                value={
                  delivery.createdAt
                }
              />

              <DetailItem
                label="Last updated"
                value={
                  delivery.updatedAt
                }
              />

              <DetailItem
                label="Delivery ID"
                value={delivery.id}
              />
            </div>
          </SectionCard>
        </aside>
      </div>
    </DashboardShell>);
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

function DeliveryActivity({
  status,
  createdAt,
  updatedAt,
  rider,
}: {
  status: string;
  createdAt: string;
  updatedAt: string;
  rider: string;
}) {
  return (
    <div className="space-y-5">
      <ActivityItem
        title="Delivery request created"
        description="The retailer submitted a new delivery request."
        time={createdAt}
        complete
      />

      {rider !== "Not assigned" && (
        <ActivityItem
          title="Rider assigned"
          description={`${rider} was assigned to this delivery.`}
          time={updatedAt}
          complete
        />
      )}

      <ActivityItem
        title="Latest delivery status"
        description={`Current recorded status: ${formatStatus(
          status
        )}.`}
        time={updatedAt}
        complete
      />
    </div>
  );
}

function ActivityItem({
  title,
  description,
  time,
  complete,
}: {
  title: string;
  description: string;
  time: string;
  complete?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
          complete
            ? "bg-emerald-500"
            : "bg-slate-300"
        }`}
      />

      <div>
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {time}
        </p>
      </div>
    </div>
  );
}

function ConfirmationStatus({
  status,}: {
  status:
    | "not_ready"
    | "awaiting_confirmation"
    | "confirmed";
}) {
  if (status === "confirmed") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-800">
          ✓ Delivery confirmed
        </p>

        <p className="mt-1 text-sm leading-6 text-emerald-700">
          The order confirmation was
          successfully completed.
        </p>
      </div>
    );
  }

  if (
    status ===
    "awaiting_confirmation"
  ) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-semibold text-amber-800">
          Awaiting confirmation
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-700">
          The rider marked the package as
          delivered. Final QR/order confirmation
          is still required.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-700">
        Not ready yet
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        Delivery confirmation becomes available
        when the package reaches the confirmation
        stage.
      </p>
    </div>
  );
}

function formatStatus(
  status: string
) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function getInitials(
  name: string
) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
