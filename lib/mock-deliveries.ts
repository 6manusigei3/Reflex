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

Emmanuel Kipchumba Sigei
20:42
import type { DeliveryStatus } from "@/lib/delivery";

export type RetailerDelivery = {
  id: string;
  customer: string;
  phone: string;
  pickup: string;
  destination: string;
  item: string;
  rider: string;
  riderPhone?: string;
  status: DeliveryStatus;
  priority: "normal" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  confirmationStatus:
    | "not_ready"
    | "awaiting_confirmation"
    | "confirmed";
};

export const retailerDeliveries: RetailerDelivery[] = [
  {
    id: "RFX-1008",
    customer: "Grace Wanjiku",
    phone: "0712 345 678",
    pickup: "Westlands, Nairobi",
    destination: "Kilimani, Nairobi",
    item: "HP laptop charger",
    rider: "David Mwangi",
    riderPhone: "0722 118 420",
    status: "in_transit",
    priority: "high",
    createdAt: "26 Aug 2026, 2:30 PM",
    updatedAt: "26 Aug 2026, 4:18 PM",
    confirmationStatus: "not_ready",
  },
  {
    id: "RFX-1007",
    customer: "Brian Otieno",
    phone: "0798 442 113",
    pickup: "CBD, Nairobi",
    destination: "Westlands, Nairobi",
    item: "Wireless keyboard and mouse",
    rider: "Kevin Kiptoo",
    riderPhone: "0710 330 208",
    status: "picked_up",
    priority: "normal",
    createdAt: "26 Aug 2026, 1:15 PM",
    updatedAt: "26 Aug 2026, 3:42 PM",
    confirmationStatus: "not_ready",
  },
  {
    id: "RFX-1006",
    customer: "Mercy Achieng",
    phone: "0701 728 551",
    pickup: "Ngara, Nairobi",
    destination: "Lavington, Nairobi",
    item: "Two sealed medicine packages",
    rider: "Not assigned",
    status: "pending",
    priority: "urgent",
    createdAt: "26 Aug 2026, 11:42 AM",
    updatedAt: "26 Aug 2026, 11:42 AM",
    confirmationStatus: "not_ready",
  },
  {
    id: "RFX-1005",
    customer: "Peter Kamau",
    phone: "0724 811 640",
    pickup: "Industrial Area, Nairobi",
    destination: "South B, Nairobi",
    item: "Hardware tools",
    rider: "Samuel Maina",
    riderPhone: "0715 463 201",
    status: "completed",
    priority: "normal",
    createdAt: "26 Aug 2026, 9:25 AM",
    updatedAt: "26 Aug 2026, 12:58 PM",
    confirmationStatus: "confirmed",
  },
  {
    id: "RFX-1004",
    customer: "Faith Njeri",
    phone: "0788 902 445",
    pickup: "Parklands, Nairobi",
    destination: "Parklands, Nairobi",
    item: "Phone accessories",
    rider: "James Kariuki",
    riderPhone: "0708 772 304",
    status: "delivered",
    priority: "normal",
    createdAt: "25 Aug 2026, 4:10 PM",
    updatedAt: "25 Aug 2026, 5:55 PM",
    confirmationStatus: "awaiting_confirmation",
  },
  {
    id: "RFX-1003",
    customer: "Cynthia Njeri",
    phone: "0711 940 113",
    pickup: "Kilimani, Nairobi",
    destination: "Karen, Nairobi",
    item: "Bluetooth headphones",
    rider: "David Mwangi",
    riderPhone: "0722 118 420",
    status: "completed",
    priority: "normal",
    createdAt: "25 Aug 2026, 10:15 AM",
    updatedAt: "25 Aug 2026, 1:20 PM",
    confirmationStatus: "confirmed",
  },
];
