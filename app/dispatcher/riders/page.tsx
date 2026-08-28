import DashboardShell from "@/components/layout/DashboardShell";
import RiderList from "@/components/dispatcher/RiderList";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function RidersPage() {
  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Riders"
        description="Review the live rider roster, availability and active delivery workload."
      />

      <SectionCard
        title="Rider availability"
        description="See which riders are available and how many active deliveries they are handling."
      >
        <RiderList />
      </SectionCard>
    </DashboardShell>
  );
}
