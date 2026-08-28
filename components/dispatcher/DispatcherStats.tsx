"use client";

import StatCard from "@/components/ui/StatCard";
import type { DispatcherRequest, Rider } from "@/lib/mock-dispatcher";
import { useApiList } from "@/lib/use-api-data";

function RequestIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.8" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RiderIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="3" strokeWidth="1.8" />
      <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" strokeWidth="1.8" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 7h11v10H3V7ZM14 10h4l3 3v4h-7" strokeWidth="1.8" />
      <circle cx="7" cy="18" r="2" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="m8 12 2.5 2.5L16 9" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DispatcherStats({
  fallbackDeliveries,
  fallbackRiders,
}: {
  fallbackDeliveries: DispatcherRequest[];
  fallbackRiders: Rider[];
}) {
  const { data: deliveries } = useApiList<DispatcherRequest>(
    "/deliveries",
    fallbackDeliveries
  );
  const { data: riders } = useApiList<Rider>("/riders", fallbackRiders);

  const openRequests = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;
  const availableRiders = riders.filter((rider) => rider.available).length;
  const activeDeliveries = deliveries.filter((delivery) =>
    ["assigned", "picked_up", "in_transit", "delivered"].includes(
      delivery.status
    )
  ).length;
  const completed = deliveries.filter(
    (delivery) => delivery.status === "completed"
  ).length;

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        title="Open Requests"
        value={openRequests}
        description="waiting for assignment"
        icon={<RequestIcon />}
      />
      <StatCard
        title="Available Riders"
        value={availableRiders}
        description="ready for assignment"
        icon={<RiderIcon />}
      />
      <StatCard
        title="Active Deliveries"
        value={activeDeliveries}
        description="currently in progress"
        icon={<TruckIcon />}
      />
      <StatCard
        title="Completed"
        value={completed}
        description="customer confirmed"
        icon={<CheckIcon />}
      />
    </section>
  );
}
