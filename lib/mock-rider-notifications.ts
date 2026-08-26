export type RiderNotification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type:
    | "assignment"
    | "status"
    | "confirmation"
    | "system";
  read: boolean;
  deliveryId?: string;
};

export const riderNotifications: RiderNotification[] = [
  {
    id: 1,
    title: "New delivery assigned",
    message:
      "Delivery RFX-1013 has been assigned to you. Pickup is at CBD, Nairobi.",
    time: "8 min ago",
    type: "assignment",
    read: false,
    deliveryId: "RFX-1013",
  },
  {
    id: 2,
    title: "Delivery confirmed",
    message:
      "The customer confirmed receipt of delivery RFX-1003.",
    time: "Yesterday, 1:22 PM",
    type: "confirmation",
    read: true,
    deliveryId: "RFX-1003",
  },
  {
    id: 3,
    title: "Status successfully updated",
    message:
      "RFX-1008 was updated to In Transit.",
    time: "Today, 4:18 PM",
    type: "status",
    read: true,
    deliveryId: "RFX-1008",
  },
  {
    id: 4,
    title: "Reflex rider account",
    message:
      "Your rider profile is active and available for delivery assignments.",
    time: "25 Aug, 8:00 AM",
    type: "system",
    read: true,
  },
];
