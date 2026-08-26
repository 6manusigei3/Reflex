import type { DeliveryStatus } from "@/lib/delivery";

export type RiderDelivery = {
  id: string;
  customer: string;
  customerPhone: string;
  pickup: string;
  destination: string;
  item: string;
  status: DeliveryStatus;
  priority: "normal" | "high" | "urgent";
  retailer: string;
  assignedAt: string;
  updatedAt: string;
};

export const riderDeliveries: RiderDelivery[] = [
  {
    id: "RFX-1008",
    customer: "Grace Wanjiku",
    customerPhone: "0712 345 678",
    pickup: "Westlands, Nairobi",
    destination: "Kilimani, Nairobi",
    item: "HP laptop charger",
    status: "in_transit",
    priority: "high",
    retailer: "MetroTech Electronics",
    assignedAt: "26 Aug 2026, 2:40 PM",
    updatedAt: "26 Aug 2026, 4:18 PM",
  },
  {
    id: "RFX-1013",
    customer: "Faith Akinyi",
    customerPhone: "0720 884 311",
    pickup: "CBD, Nairobi",
    destination: "Upper Hill, Nairobi",
    item: "Document envelope",
    status: "assigned",
    priority: "normal",
    retailer: "City Office Supplies",
    assignedAt: "26 Aug 2026, 5:12 PM",
    updatedAt: "26 Aug 2026, 5:12 PM",
  },
  {
    id: "RFX-1003",
    customer: "Cynthia Njeri",
    customerPhone: "0711 940 113",
    pickup: "Kilimani, Nairobi",
    destination: "Karen, Nairobi",
    item: "Bluetooth headphones",
    status: "completed",
    priority: "normal",
    retailer: "MetroTech Electronics",
    assignedAt: "25 Aug 2026, 10:25 AM",
    updatedAt: "25 Aug 2026, 1:20 PM",
  },
];
