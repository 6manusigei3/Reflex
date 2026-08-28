"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryCard from "@/components/rider/RiderDeliveryCard";
import RiderStats from "@/components/rider/RiderStats";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";

import {
  riderDeliveries,
  type RiderDelivery,
} from "@/lib/mock-rider";
import { useApiList } from "@/lib/use-api-data";

export default function RiderDashboard() {
  const { data: deliveries, error } =
    useApiList<RiderDelivery>("/deliveries", riderDeliveries);
  const assigned = deliveries.filter(
    (delivery) => delivery.status === "assigned"
  ).length;

  const active = deliveries.filter(
    (delivery) =>
      delivery.status === "picked_up" ||
      delivery.status === "in_transit" ||
      delivery.status === "delivered"
  ).length;

  const completed = deliveries.filter(
    (delivery) => delivery.status === "completed"
  ).length;

  const currentDeliveries =
    deliveries.filter(
      (delivery) =>
        delivery.status !== "completed" &&
        delivery.status !== "cancelled" &&
        delivery.status !== "failed"
    );

  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <PageHeader
        eyebrow="Rider workspace"
        title="My Deliveries"
        description="View your assigned deliveries and update their progress."
      />

      <RiderStats
        assigned={assigned}
        active={active}
        completed={completed}
      />

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live assignments are unavailable. Reconnect to the Reflex API to continue.
        </div>
      )}

      <section className="mt-6">
        <SectionCard
          title="Current Deliveries"
          description="Deliveries currently assigned to you."
        >
          {currentDeliveries.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {currentDeliveries.map((delivery) => (
              <RiderDeliveryCard
                key={delivery.id}
                delivery={delivery}
              />
              ))}
            </div>
          ) : (
            <EmptyState title="No deliveries assigned yet" description="New assignments will appear here as soon as a dispatcher assigns them to you." />
          )}
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
