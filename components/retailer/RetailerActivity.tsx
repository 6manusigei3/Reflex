"use client";

import {
  retailerDeliveries,
  type RetailerDelivery,
} from "@/lib/mock-deliveries";
import { useApiList } from "@/lib/use-api-data";

type ActivityType = "created" | "assigned" | "transit" | "completed";

const dotStyles: Record<ActivityType, string> = {
  created: "bg-slate-400",
  assigned: "bg-blue-500",
  transit: "bg-amber-500",
  completed: "bg-emerald-500",
};

function activityType(delivery: RetailerDelivery): ActivityType {
  if (delivery.status === "completed") return "completed";
  if (["picked_up", "in_transit", "delivered"].includes(delivery.status)) {
    return "transit";
  }
  if (delivery.status === "assigned") return "assigned";
  return "created";
}

function activityTitle(delivery: RetailerDelivery) {
  if (delivery.status === "completed") return `${delivery.id} completed`;
  if (delivery.status === "pending") return `${delivery.id} created`;
  if (delivery.status === "assigned") {
    return `Rider assigned to ${delivery.id}`;
  }
  return `${delivery.id} ${delivery.status.replaceAll("_", " ")}`;
}

export default function RetailerActivity() {
  const { data, loading } = useApiList<RetailerDelivery>(
    "/deliveries",
    retailerDeliveries
  );
  const activities = data.slice(0, 4);

  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading activity…</p>;
  }

  if (!activities.length) {
    return <div className="py-8 text-center"><p className="font-semibold text-slate-900">No activity yet</p><p className="mt-2 text-sm leading-6 text-slate-500">Delivery updates will appear here as your team starts working.</p></div>;
  }

  return (
    <div className="space-y-1">
      {activities.map((delivery, index) => {
        const type = activityType(delivery);
        return (
          <div
            key={delivery.id}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index !== activities.length - 1 && (
              <span className="absolute left-[7px] top-5 h-[calc(100%-8px)] w-px bg-slate-200" />
            )}
            <span
              className={`relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-white ${dotStyles[type]}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold capitalize text-slate-900">
                {activityTitle(delivery)}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {delivery.customer} • {delivery.destination}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {delivery.updatedAt}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
