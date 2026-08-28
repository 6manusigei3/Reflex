import AdminOverview from "@/components/admin/AdminOverview";
import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
export default function AdminPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Admin overview" description="Manage access and monitor Reflex-wide operations without replacing dispatch." /><AdminOverview /></DashboardShell>; }
