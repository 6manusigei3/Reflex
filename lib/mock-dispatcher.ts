import type { DeliveryStatus } from "@/lib/delivery";

export type DispatcherRequest = {
  id: string;
  retailer: string;
  customer: string;
  phone: string;
  pickup: string;
  destination: string;
  item: string;
  priority: "normal" | "high" | "urgent";
  status: DeliveryStatus;
  rider: string | null;
  createdAt: string;
};

export type Rider = {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  activeDeliveries: number;
};

export const dispatcherRequests: DispatcherRequest[] = [
  {
    id: "RFX-1012",
    retailer: "MetroTech Electronics",
    customer: "Anne Wambui",
    phone: "0712 450 221",
    pickup: "Westlands, Nairobi",
    destination: "Kileleshwa, Nairobi",
    item: "Laptop charger",
    priority: "high",
    status: "pending",
    rider: null,
    createdAt: "26 Aug, 5:40 PM",
  },
  {
    id: "RFX-1011",
    retailer: "AfyaPlus Pharmacy",
    customer: "Dennis Kiprotich",
    phone: "0728 119 804",
    pickup: "Ngara, Nairobi",
    destination: "Kilimani, Nairobi",
    item: "Prescription medicine package",
    priority: "urgent",
    status: "pending",
    rider: null,
    createdAt: "26 Aug, 5:18 PM",
  },
  {
    id: "RFX-1010",
    retailer: "BuildRight Hardware",
    customer: "Mary Njeri",
    phone: "0705 663 891",
    pickup: "Industrial Area, Nairobi",
    destination: "South C, Nairobi",
    item: "Electrical fittings",
    priority: "normal",
    status: "pending",
    rider: null,
    createdAt: "26 Aug, 4:55 PM",
  },
  {
    id: "RFX-1009",
    retailer: "MetroTech Electronics",
    customer: "John Mutua",
    phone: "0790 305 778",
    pickup: "CBD, Nairobi",
    destination: "Parklands, Nairobi",
    item: "Wireless mouse",
    priority: "normal",
    status: "assigned",
    rider: "David Mwangi",
    createdAt: "26 Aug, 4:20 PM",
  },
];

export const reflexRiders: Rider[] = [
  {
    id: "RDR-001",
    name: "David Mwangi",
    phone: "0722 118 420",
    available: true,
    activeDeliveries: 1,
  },
  {
    id: "RDR-002",
    name: "Kevin Kiptoo",
    phone: "0710 330 208",
    available: true,
    activeDeliveries: 0,
  },
  {
    id: "RDR-003",
    name: "Samuel Maina",
    phone: "0715 463 201",
    available: false,
    activeDeliveries: 2,
  },
  {
    id: "RDR-004",
    name: "James Kariuki",
    phone: "0708 772 304",
    available: true,
    activeDeliveries: 1,
  },
];
