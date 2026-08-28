"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DeliveryStatusTimeline from "@/components/delivery/DeliveryStatusTimeline";
import DeliveryMap from "@/components/maps/DeliveryMap";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { ApiError, DEMO_FALLBACK_ENABLED, apiRequest, getErrorMessage, type ApiDelivery } from "@/lib/api";
import { retailerDeliveries } from "@/lib/mock-deliveries";
import { useDeliverySnapshots } from "@/lib/use-api-data";

export default function RetailerDeliveryDetail({ id }: { id: string }) {
  const fallback = retailerDeliveries.find((item) => item.id === id);
  const [delivery, setDelivery] = useState<ApiDelivery | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [offlineFallback, setOfflineFallback] = useState(false);

  useDeliverySnapshots((deliveries) => {
    const updated = deliveries.find((item) => item.id === id);
    if (updated) {
      setDelivery(updated);
      setError("");
      setLoading(false);
    }
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await apiRequest<ApiDelivery>(`/deliveries/${id}`);
        if (active) setDelivery(result);
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
          setOfflineFallback(
            DEMO_FALLBACK_ENABLED &&
              loadError instanceof ApiError &&
              loadError.status === 0
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const visible = delivery ?? (offlineFallback ? fallback : undefined);
  if (!visible && loading) {
    return (
      <SectionCard className="mx-auto max-w-xl">
        <div className="py-10 text-center text-sm font-semibold text-slate-500">
          Loading delivery…
        </div>
      </SectionCard>
    );
  }

  if (!visible) {
    return (
      <SectionCard className="mx-auto max-w-xl">
        <div className="py-10 text-center">
          <p className="font-bold text-slate-950">Delivery not found</p>
          <p className="mt-2 text-sm text-slate-500">{error || "This delivery record is unavailable."}</p>
          <Link href="/retailer/deliveries" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Back to deliveries</Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <>
      <Link href="/retailer/deliveries" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600">← Back to deliveries</Link>
      <PageHeader
        eyebrow="Delivery details"
        title={visible.id}
        description={`${visible.customer} • ${visible.destination}`}
        action={<StatusBadge status={visible.status} />}
      />
      {error && !delivery && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Live data is unavailable; showing the saved demo record.</div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard title="Delivery information" description="Customer, package and route information.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Detail label="Customer" value={visible.customer} />
              <Detail label="Phone" value={visible.phone} />
              <Detail label="Pickup" value={visible.pickup} />
              <Detail label="Destination" value={visible.destination} />
              <Detail label="Item" value={visible.item} />
              <Detail label="Priority" value={capitalize(visible.priority)} />
            </div>
          </SectionCard>
          <SectionCard title="Route map" description="Pickup and destination context for this delivery.">
            <DeliveryMap
              pickup={visible.pickup}
              destination={visible.destination}
              pickupLatitude={visible.pickupLatitude}
              pickupLongitude={visible.pickupLongitude}
              destinationLatitude={visible.destinationLatitude}
              destinationLongitude={visible.destinationLongitude}
            />
          </SectionCard>
          <SectionCard title="Delivery progress" description="Current position in the delivery lifecycle.">
            <DeliveryStatusTimeline currentStatus={visible.status} />
          </SectionCard>
        </div>
        <aside className="space-y-6">
          <SectionCard title="Assigned rider" description="Rider currently handling this delivery.">
            {visible.rider && visible.rider !== "Not assigned" ? (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{initials(visible.rider)}</div>
                <div><p className="font-semibold text-slate-950">{visible.rider}</p><p className="mt-1 text-sm text-slate-500">{visible.riderPhone || "Phone unavailable"}</p></div>
              </div>
            ) : <p className="text-sm leading-6 text-slate-500">A dispatcher has not assigned a rider yet.</p>}
          </SectionCard>
          <SectionCard title="Record details">
            <div className="space-y-4">
              <Detail label="Created" value={visible.createdAt} />
              <Detail label="Last updated" value={visible.updatedAt} />
              <Detail label="Confirmation" value={capitalize(visible.confirmationStatus ?? "not_ready")} />
            </div>
          </SectionCard>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-medium leading-6 text-slate-800">{value}</p></div>;
}

function capitalize(value: string) {
  return value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function initials(value: string) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
