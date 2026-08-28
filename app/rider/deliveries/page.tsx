"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryCard from "@/components/rider/RiderDeliveryCard";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import { riderDeliveries, type RiderDelivery } from "@/lib/mock-rider";
import { useApiList } from "@/lib/use-api-data";

export default function RiderDeliveriesPage() {
  const { data: deliveries, error } =
    useApiList<RiderDelivery>("/deliveries", riderDeliveries);
  const current = deliveries.filter(
    (delivery) => !["completed", "cancelled", "failed"].includes(delivery.status)
  );

  return (
    <DashboardShell role="rider" userName="David Mwangi">
      <PageHeader
        eyebrow="Rider workspace"
        title="My Deliveries"
        description="Review every active assignment and open a delivery to update its progress."
      />
      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live assignments are unavailable. Reconnect to the Reflex API to continue.
        </div>
      )}
      <SectionCard title="Active assignments" description={`${current.length} deliveries require your attention`}>
        {current.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {current.map((delivery) => <RiderDeliveryCard key={delivery.id} delivery={delivery} />)}
          </div>
        ) : (
          <div className="py-12 text-center"><p className="font-semibold text-slate-900">No deliveries assigned yet</p><p className="mt-2 text-sm text-slate-500">New assignments will appear here as soon as a dispatcher assigns them to you.</p></div>
        )}
      </SectionCard>
    </DashboardShell>
  );
}
