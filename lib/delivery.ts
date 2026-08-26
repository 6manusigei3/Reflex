export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "completed"
  | "failed"
  | "cancelled";

export const deliveryStatusLabels: Record<
  DeliveryStatus,
  string
> = {
  pending: "Pending",
  assigned: "Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const mainDeliveryFlow: DeliveryStatus[] = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "completed",
];

export type DeliveryPriority =
  | "normal"
  | "high"
  | "urgent";
