"use client";

import { useState } from "react";

import PageHeader from "@/components/ui/PageHeader";
import RiderDeliveryDetails from "@/components/rider/RiderDeliveryDetails";
import StatusBadge from "@/components/ui/StatusBadge";

import type { RiderDelivery } from "@/lib/mock-rider";
import type { DeliveryStatus } from "@/lib/delivery";
import { apiRequest, getErrorMessage, type ApiDelivery } from "@/lib/api";

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
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: DeliveryStatus) {
    try {
      const updated = await apiRequest<ApiDelivery>(
        `/deliveries/${delivery.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }
      );
      setStatus(updated.status);
      setError("");
      return true;
    } catch (updateError) {
      setError(getErrorMessage(updateError));
      return false;
    }
  }

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
        onStatusChange={updateStatus}
      />
      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
    </>
  );
}
