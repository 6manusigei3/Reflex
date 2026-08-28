"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import RiderHistoryList from "@/components/rider/RiderHistoryList";

import {
  riderDeliveries,
  type RiderDelivery,
} from "@/lib/mock-rider";
import { useApiList } from "@/lib/use-api-data";

export default function RiderHistoryPage() {
  const { data: deliveries } =
    useApiList<RiderDelivery>("/deliveries", riderDeliveries);
  const completedDeliveries =
    deliveries.filter(
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
