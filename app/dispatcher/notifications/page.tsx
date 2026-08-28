import DashboardShell from "@/components/layout/DashboardShell";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function DispatcherNotificationsPage() {
  return <DashboardShell role="dispatcher" userName="A. Wanjala"><PageHeader eyebrow="Dispatcher workspace" title="Notifications" description="Monitor operational changes across the delivery network." /><SectionCard title="Operations activity" description="Assignments, delivery updates and confirmations."><NotificationCenter role="dispatcher" /></SectionCard></DashboardShell>;
}
