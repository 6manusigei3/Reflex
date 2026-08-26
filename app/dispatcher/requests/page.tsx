import DashboardShell from "@/components/layout/DashboardShell";
import OpenRequestsTable from "@/components/dispatcher/OpenRequestsTable";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

import {
  dispatcherRequests,
  reflexRiders,
} from "@/lib/mock-dispatcher";

export default function OpenRequestsPage() {
  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Open Requests"
        description="Review new delivery requests and assign them to available riders."
      />

      <SectionCard>
        <OpenRequestsTable
          initialRequests={dispatcherRequests}
          riders={reflexRiders}
        />
      </SectionCard>
    </DashboardShell>
  );
}
