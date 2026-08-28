import AdminUsers from "@/components/admin/AdminUsers";
import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
export default function AdminUsersPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Platform users" description="Activate, suspend and review role access across Reflex." /><AdminUsers /></DashboardShell>; }
