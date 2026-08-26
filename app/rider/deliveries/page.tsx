import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryCard from "@/components/rider/RiderDeliveryCard";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

import {
  riderDeliveries,
} from "@/lib/mock-rider";

export default function RiderDeliveriesPage() {
  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <PageHeader
        eyebrow="Rider workspace"
        title="Assigned Deliveries"
        description="View all deliveries assigned to your rider account."
      />

      <SectionCard>
        <div className="grid gap-4 xl:grid-cols-2">
          {riderDeliveries.map((delivery) => (
            <RiderDeliveryCard
              key={delivery.id}
              delivery={delivery}
            />
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
