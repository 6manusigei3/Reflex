import DispatcherDeliveries from "@/components/dispatcher/DispatcherDeliveries";
import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
export default function AdminDeliveriesPage() { return <DashboardShell role="admin" userName="Reflex Admin"><PageHeader eyebrow="Platform visibility" title="Delivery activity" description="Inspect platform-wide delivery progress while Dispatchers retain operational control." /><SectionCard title="All deliveries" description="Read-only operational visibility across Reflex."><DispatcherDeliveries /></SectionCard></DashboardShell>; }
