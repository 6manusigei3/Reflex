import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import DeliveryList from "@/components/retailer/DeliveryList";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import {
  retailerDeliveries,
} from "@/lib/mock-deliveries";

export default function DeliveriesPage() {
  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <PageHeader
        eyebrow="Retailer workspace"
        title="My Deliveries"
        description="View and track all delivery requests from one place."
        action={
          <Link
            href="/retailer/new-delivery"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <span className="text-lg">
              +
            </span>
            New Delivery
          </Link>
        }
      />

      <SectionCard>
        <DeliveryList
          deliveries={retailerDeliveries}
        />
      </SectionCard>
    </DashboardShell>
  );
}
