import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import DispatcherStats from "@/components/dispatcher/DispatcherStats";
import OpenRequestsTable from "@/components/dispatcher/OpenRequestsTable";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

import {
  dispatcherRequests,
  reflexRiders,
} from "@/lib/mock-dispatcher";

export default function DispatcherDashboard() {
  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Dispatch Overview"
        description="Manage incoming delivery requests, rider assignments and active deliveries."
      />

      <DispatcherStats
        fallbackDeliveries={dispatcherRequests}
        fallbackRiders={reflexRiders}
      />

      <section className="mt-6">
        <SectionCard
          title="Open Delivery Requests"
          description="Assign available riders to new retailer delivery requests."
          action={
            <Link
              href="/dispatcher/requests"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all requests
            </Link>
          }
        >
          <OpenRequestsTable
            initialRequests={dispatcherRequests}
            riders={reflexRiders}
          />
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
