import DashboardShell from "@/components/layout/DashboardShell";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function RetailerNotificationsPage() {
  return <DashboardShell role="retailer" userName="J. Kamau"><PageHeader eyebrow="Retailer workspace" title="Notifications" description="Track rider assignments, progress changes and customer confirmations." /><SectionCard title="Recent activity" description="Updates for your organization’s deliveries."><NotificationCenter role="retailer" /></SectionCard></DashboardShell>;
}
