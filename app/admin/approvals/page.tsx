import AdminUsers from "@/components/admin/AdminUsers";
import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
export default function AdminApprovalsPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Pending approvals" description="Review Retailer, Dispatcher and Rider access requests." /><AdminUsers approvalsOnly /></DashboardShell>; }
