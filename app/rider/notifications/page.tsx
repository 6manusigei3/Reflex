import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import RiderNotifications from "@/components/rider/RiderNotifications";
import RealtimeStatusPanel from "@/components/rider/RealtimeStatusPanel";

import {
  riderNotifications,
} from "@/lib/mock-rider-notifications";

export default function RiderNotificationsPage() {
  return (
    <DashboardShell
      role="rider"
      userName="David Mwangi"
    >
      <PageHeader
        eyebrow="Rider workspace"
        title="Notifications"
        description="Stay updated on new assignments, delivery changes and customer confirmations."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard
          title="Notifications"
          description="Recent rider account and delivery activity."
        >
          <RiderNotifications
            initialNotifications={
              riderNotifications
            }
          />
        </SectionCard>

        <SectionCard
          title="Live Delivery Feed"
          description="Interface for real-time delivery updates."
        >
          <RealtimeStatusPanel />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
