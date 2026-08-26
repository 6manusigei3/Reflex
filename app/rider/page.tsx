import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryCard from "@/components/rider/RiderDeliveryCard";
import RiderStats from "@/components/rider/RiderStats";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

import {
  riderDeliveries,
} from "@/lib/mock-rider";

export default function RiderDashboard() {
  const assigned = riderDeliveries.filter(
    (delivery) => delivery.status === "assigned"
  ).length;

  const active = riderDeliveries.filter(
    (delivery) =>
      delivery.status === "picked_up" ||
      delivery.status === "in_transit" ||
      delivery.status === "delivered"
  ).length;

  const completed = riderDeliveries.filter(
    (delivery) => delivery.status === "completed"
  ).length;

  const currentDeliveries =
    riderDeliveries.filter(
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

      <section className="mt-6">
        <SectionCard
          title="Current Deliveries"
          description="Deliveries currently assigned to you."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {currentDeliveries.map((delivery) => (
              <RiderDeliveryCard
                key={delivery.id}
                delivery={delivery}
              />
            ))}
          </div>
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
