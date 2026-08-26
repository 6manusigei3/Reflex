import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import RiderHistoryList from "@/components/rider/RiderHistoryList";

import {
  riderDeliveries,
} from "@/lib/mock-rider";

export default function RiderHistoryPage() {
  const completedDeliveries =
    riderDeliveries.filter(
      (delivery) =>
        delivery.status ===
          "completed" ||
        delivery.status ===
          "delivered"
    );

  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <PageHeader
        eyebrow="Rider workspace"
        title="Delivery History"
        description="Review deliveries that you have completed or delivered."
      />

      <SectionCard
        title="Previous Deliveries"
        description={`${completedDeliveries.length} completed delivery records`}
      >
        <RiderHistoryList
          deliveries={
            completedDeliveries
          }
        />
      </SectionCard>
    </DashboardShell>
  );
}
