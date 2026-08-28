"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import RiderDeliveryScreen from "@/components/rider/RiderDeliveryScreen";
import SectionCard from "@/components/ui/SectionCard";
import { ApiError, DEMO_FALLBACK_ENABLED, apiRequest, getErrorMessage, type ApiDelivery } from "@/lib/api";
import { riderDeliveries, type RiderDelivery } from "@/lib/mock-rider";
import { useDeliverySnapshots } from "@/lib/use-api-data";

export default function RiderDeliveryLoader({ id }: { id: string }) {
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
          if (
            DEMO_FALLBACK_ENABLED &&
            loadError instanceof ApiError &&
            loadError.status === 0
          ) {
            setDelivery(
              riderDeliveries.find((item) => item.id === id) ?? null
            );
          }
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

  if (!delivery && loading) {
    return (
      <SectionCard>
        <div className="py-12 text-center text-sm font-semibold text-slate-500">
          Loading assignment…
        </div>
      </SectionCard>
    );
  }

  if (!delivery) {
    return (
      <SectionCard>
        <div className="py-12 text-center">
          <p className="font-bold text-slate-950">Delivery not found</p>
          <p className="mt-2 text-sm text-slate-500">{error || "This assignment is unavailable."}</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <>
      <Link href="/rider/deliveries" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600">← Back to deliveries</Link>
      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Live data is unavailable; showing the saved demo assignment.</div>
      )}
      <RiderDeliveryScreen
        key={`${delivery.id}-${delivery.status}`}
        delivery={delivery}
      />
    </>
  );
}
