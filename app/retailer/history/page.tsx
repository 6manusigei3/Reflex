import DashboardShell from "@/components/layout/DashboardShell";
import RetailerHistory from "@/components/retailer/RetailerHistory";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function RetailerHistoryPage() {
  return <DashboardShell role="retailer" userName="J. Kamau"><PageHeader eyebrow="Retailer workspace" title="Delivery History" description="Review delivered, completed, failed and cancelled requests." /><SectionCard title="Previous deliveries" description="A complete operational record of final-stage deliveries."><RetailerHistory /></SectionCard></DashboardShell>;
}
