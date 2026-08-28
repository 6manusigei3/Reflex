import type { ApiDelivery } from "@/lib/api";

export type RetailerDelivery = Pick<
  ApiDelivery,
  | "id"
  | "customer"
  | "phone"
  | "pickup"
  | "destination"
  | "pickupLatitude"
  | "pickupLongitude"
  | "destinationLatitude"
  | "destinationLongitude"
  | "item"
  | "rider"
  | "riderPhone"
  | "status"
  | "priority"
  | "createdAt"
  | "updatedAt"
  | "confirmationStatus"
>;

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
    riderPhone: null,
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
