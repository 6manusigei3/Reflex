import DashboardShell from "@/components/layout/DashboardShell";
import SettingsPanel from "@/components/settings/SettingsPanel";
import PageHeader from "@/components/ui/PageHeader";

export default function RiderSettingsPage() {
  return <DashboardShell role="rider" userName="David Mwangi"><PageHeader eyebrow="Rider workspace" title="Settings" description="Review your account and delivery notification preferences." /><SettingsPanel fallbackName="David Mwangi" /></DashboardShell>;
}
