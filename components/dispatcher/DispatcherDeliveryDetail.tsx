"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DeliveryMap from "@/components/maps/DeliveryMap";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiRequest, getErrorMessage, type ApiDelivery } from "@/lib/api";

export default function DispatcherDeliveryDetail({ id }: { id: string }) {
  const [delivery, setDelivery] = useState<ApiDelivery | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await apiRequest<ApiDelivery>(`/deliveries/${id}`);
        if (active) setDelivery(result);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (!delivery) {
    return (
      <SectionCard>
        <div className="py-12 text-center">
          <p className="font-bold text-slate-950">{error ? "Delivery unavailable" : "Loading delivery…"}</p>
          {error && <p className="mt-2 text-sm text-slate-500">{error}</p>}
          <Link href="/dispatcher/deliveries" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Back to monitoring</Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <>
      <Link href="/dispatcher/deliveries" className="mb-5 inline-flex text-sm font-semibold text-slate-500 hover:text-blue-600">← Back to monitoring</Link>
      <PageHeader
        eyebrow="Delivery monitoring"
        title={delivery.id}
        description={`${delivery.pickup} → ${delivery.destination}`}
        action={<StatusBadge status={delivery.status} />}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard title="Route map" description="Pickup and destination context for dispatch operations.">
          <DeliveryMap
            pickup={delivery.pickup}
            destination={delivery.destination}
            pickupLatitude={delivery.pickupLatitude}
            pickupLongitude={delivery.pickupLongitude}
            destinationLatitude={delivery.destinationLatitude}
            destinationLongitude={delivery.destinationLongitude}
          />
        </SectionCard>
        <aside className="space-y-6">
          <SectionCard title="Route details">
            <Detail label="Pickup" value={delivery.pickup} />
            <div className="my-5 border-t border-slate-100" />
            <Detail label="Destination" value={delivery.destination} />
          </SectionCard>
          <SectionCard title="Assignment">
            <Detail label="Retailer" value={delivery.retailer} />
            <div className="my-5 border-t border-slate-100" />
            <Detail label="Rider" value={delivery.rider ?? "Not assigned"} />
          </SectionCard>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-800">{value}</p></div>;
}
