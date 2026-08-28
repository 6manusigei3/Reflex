import AdminActivity from "@/components/admin/AdminActivity";
import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
export default function AdminActivityPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Activity and audit" description="Review meaningful account and delivery events." /><AdminActivity /></DashboardShell>; }
