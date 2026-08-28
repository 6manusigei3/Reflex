import DashboardShell from "@/components/layout/DashboardShell";
import SettingsPanel from "@/components/settings/SettingsPanel";
import PageHeader from "@/components/ui/PageHeader";
export default function AdminSettingsPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform governance" title="Settings" description="Review your administrator account and preferences." /><SettingsPanel fallbackName="Reflex Admin" /></DashboardShell>; }
