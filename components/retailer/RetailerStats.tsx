"use client";

import StatCard from "@/components/ui/StatCard";
import { retailerDeliveries, type RetailerDelivery } from "@/lib/mock-deliveries";
import { useApiList } from "@/lib/use-api-data";

const iconNames = ["▣", "◷", "↗", "✓"];

export default function RetailerStats() {
  const { data } = useApiList<RetailerDelivery>("/deliveries", retailerDeliveries);
  const values = [
    data.length,
    data.filter((delivery) => delivery.status === "pending").length,
    data.filter((delivery) =>
      ["assigned", "picked_up", "in_transit", "delivered"].includes(delivery.status)
    ).length,
    data.filter((delivery) => delivery.status === "completed").length,
  ];
  const cards = [
    ["Total Deliveries", "all tracked requests"],
    ["Pending", "waiting for assignment"],
    ["Active", "currently in progress"],
    ["Completed", "customer confirmed"],
  ];

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map(([title, description], index) => (
        <StatCard
          key={title}
          title={title}
          value={values[index]}
          description={description}
          icon={<span className="text-lg">{iconNames[index]}</span>}
        />
      ))}
    </section>
  );
}
