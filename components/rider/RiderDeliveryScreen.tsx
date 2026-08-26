"use client";

import { useState } from "react";

import PageHeader from "@/components/ui/PageHeader";
import RiderDeliveryDetails from "@/components/rider/RiderDeliveryDetails";
import StatusBadge from "@/components/ui/StatusBadge";

import type { RiderDelivery } from "@/lib/mock-rider";
import type { DeliveryStatus } from "@/lib/delivery";

type RiderDeliveryScreenProps = {
  delivery: RiderDelivery;
};

export default function RiderDeliveryScreen({
  delivery,
}: RiderDeliveryScreenProps) {
  const [status, setStatus] =
    useState<DeliveryStatus>(
      delivery.status
    );

  return (
    <>
      <PageHeader
        eyebrow="Assigned delivery"
        title={delivery.id}
        description={`${delivery.customer} • ${delivery.destination}`}
        action={
          <StatusBadge status={status} />
        }
      />

      <RiderDeliveryDetails
        delivery={delivery}
        status={status}
        onStatusChange={setStatus}
      />
    </>
  );
}
