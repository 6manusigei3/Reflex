import DashboardShell from "@/components/layout/DashboardShell";
import RiderList from "@/components/dispatcher/RiderList";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

import {
  reflexRiders,
} from "@/lib/mock-dispatcher";

export default function RidersPage() {
  const available =
    reflexRiders.filter(
      (rider) => rider.available
    ).length;

  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Riders"
        description={`${available} of ${reflexRiders.length} riders are currently available for assignment.`}
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
