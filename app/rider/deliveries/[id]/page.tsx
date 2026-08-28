import DashboardShell from "@/components/layout/DashboardShell";
import RiderDeliveryLoader from "@/components/rider/RiderDeliveryLoader";

type RiderDeliveryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RiderDeliveryPage({
  params,
}: RiderDeliveryPageProps) {
  const { id } = await params;

  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <RiderDeliveryLoader id={id} />
    </DashboardShell>
  );
}
