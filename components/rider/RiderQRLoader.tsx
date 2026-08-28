"use client";

import { useEffect, useState } from "react";
import QRConfirmation from "@/components/rider/QRConfirmation";
import SectionCard from "@/components/ui/SectionCard";
import { ApiError, DEMO_FALLBACK_ENABLED, apiRequest, getErrorMessage, type ApiDelivery } from "@/lib/api";
import { riderDeliveries, type RiderDelivery } from "@/lib/mock-rider";
import { useDeliverySnapshots } from "@/lib/use-api-data";

export default function RiderQRLoader({ id }: { id: string }) {
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
    return () => { active = false; };
  }, [id]);

  if (!delivery && loading) {
    return <SectionCard><div className="py-10 text-center text-sm font-semibold text-slate-500">Loading confirmation…</div></SectionCard>;
  }

  if (!delivery) {
    return <SectionCard><div className="py-10 text-center text-sm text-slate-500">{error || "Delivery information is unavailable."}</div></SectionCard>;
  }

  if (delivery.status === "completed") {
    return <SectionCard><div className="py-10 text-center"><p className="font-bold text-emerald-700">Delivery confirmed</p><p className="mt-2 text-sm text-slate-500">The customer has already confirmed receipt of this package.</p></div></SectionCard>;
  }

  if (delivery.status !== "delivered") {
    return <SectionCard><div className="py-10 text-center"><p className="font-bold text-slate-900">Confirmation is not ready</p><p className="mt-2 text-sm text-slate-500">The rider must mark this package as delivered before generating its confirmation QR code.</p></div></SectionCard>;
  }

  return (
    <>
      {error && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Using the saved delivery record while the API reconnects.</div>}
      <QRConfirmation deliveryId={delivery.id} customer={delivery.customer} destination={delivery.destination} />
    </>
  );
}
