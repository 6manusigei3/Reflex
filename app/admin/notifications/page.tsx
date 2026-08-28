import DashboardShell from "@/components/layout/DashboardShell";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
export default function AdminNotificationsPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Notifications" description="Review new account approval requests." /><SectionCard title="Admin activity"><NotificationCenter role="admin" /></SectionCard></DashboardShell>; }
