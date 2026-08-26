import DashboardShell from "@/components/layout/DashboardShell";
import NewDeliveryForm from "@/components/retailer/NewDeliveryForm";
import PageHeader from "@/components/ui/PageHeader";

export default function NewDeliveryPage() {
  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <PageHeader
        eyebrow="Retailer workspace"
        title="Create a new delivery"
        description="Enter the customer, package and destination information. The request will be sent to the dispatcher for rider assignment."
      />

      <NewDeliveryForm />
    </DashboardShell>
  );
}
