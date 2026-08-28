import DashboardShell from "@/components/layout/DashboardShell";
import SettingsPanel from "@/components/settings/SettingsPanel";
import PageHeader from "@/components/ui/PageHeader";

export default function DispatcherSettingsPage() {
  return <DashboardShell role="dispatcher" userName="A. Wanjala"><PageHeader eyebrow="Dispatcher workspace" title="Settings" description="Review your account and dispatch preferences." /><SettingsPanel fallbackName="A. Wanjala" /></DashboardShell>;
}
