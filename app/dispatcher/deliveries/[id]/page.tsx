import DashboardShell from "@/components/layout/DashboardShell";
import DispatcherDeliveryDetail from "@/components/dispatcher/DispatcherDeliveryDetail";

export default async function DispatcherDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell role="dispatcher" userName="A. Wanjala">
      <DispatcherDeliveryDetail id={id} />
    </DashboardShell>
  );
}
