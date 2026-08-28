import DashboardShell from "@/components/layout/DashboardShell";
import RetailerDeliveryDetail from "@/components/retailer/RetailerDeliveryDetail";

export default async function RetailerDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell role="retailer" userName="J. Kamau">
      <RetailerDeliveryDetail id={id} />
    </DashboardShell>
  );
}
