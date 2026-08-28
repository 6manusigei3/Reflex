import DashboardShell from "@/components/layout/DashboardShell";
import SettingsPanel from "@/components/settings/SettingsPanel";
import PageHeader from "@/components/ui/PageHeader";

export default function RetailerSettingsPage() {
  return <DashboardShell role="retailer" userName="J. Kamau"><PageHeader eyebrow="Retailer workspace" title="Settings" description="Review your Reflex account and workspace preferences." /><SettingsPanel fallbackName="J. Kamau" /></DashboardShell>;
}
