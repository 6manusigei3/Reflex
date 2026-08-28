import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import RiderQRLoader from "@/components/rider/RiderQRLoader";

type RiderConfirmationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RiderConfirmationPage({
  params,
}: RiderConfirmationPageProps) {
  const { id } = await params;

  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <Link
        href={`/rider/deliveries/${id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        ← Back to delivery
      </Link>

      <PageHeader
        eyebrow="Delivery confirmation"
        title="Confirm customer delivery"
        description="Ask the customer to scan the QR code to verify that the package was received."
      />

      <RiderQRLoader id={id} />
    </DashboardShell>
  );
}
