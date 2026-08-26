import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryDetails from "@/components/rider/RiderDeliveryDetails";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

import {
  riderDeliveries,
} from "@/lib/mock-rider";

type RiderDeliveryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RiderDeliveryPage({
  params,
}: RiderDeliveryPageProps) {
  const { id } = await params;

  const delivery =
    riderDeliveries.find(
      (item) => item.id === id
    );

  if (!delivery) {
    notFound();
  }

  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <Link
        href="/rider/deliveries"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        ← Back to deliveries
      </Link>

      <PageHeader
        eyebrow="Assigned delivery"
        title={delivery.id}
        description={`${delivery.customer} • ${delivery.destination}`}
        action={
          <StatusBadge
            status={delivery.status}
          />
        }
      />

      <RiderDeliveryDetails
        delivery={delivery}
      />
    </DashboardShell>
  );
}
