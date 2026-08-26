import DashboardShell from "@/components/layout/DashboardShell";
import DispatcherDeliveries from "@/components/dispatcher/DispatcherDeliveries";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function DispatcherDeliveriesPage() {
  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Deliveries"
        description="Monitor assigned, active and completed deliveries across the platform."
      />

      <SectionCard>
        <DispatcherDeliveries />
      </SectionCard>
    </DashboardShell>
  );
}
