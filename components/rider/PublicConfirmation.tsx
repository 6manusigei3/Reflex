"use client";

import { useEffect, useState } from "react";
import CustomerConfirmation from "@/components/rider/CustomerConfirmation";
import { apiRequest, getErrorMessage } from "@/lib/api";

type ConfirmationInfo = {
  deliveryId: string;
  customer: string;
  retailer: string;
  destination: string;
  item: string;
  status: string;
  confirmationStatus: string;
};

export default function PublicConfirmation({
  deliveryId,
  code,
}: {
  deliveryId?: string;
  code?: string;
}) {
  const [info, setInfo] = useState<ConfirmationInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!deliveryId || !code) {
        setError("This delivery confirmation link is incomplete.");
        return;
      }
      try {
        const result = await apiRequest<ConfirmationInfo>(
          `/deliveries/${encodeURIComponent(deliveryId)}/confirmation?code=${encodeURIComponent(code)}`,
          {},
          false
        );
        if (active) setInfo(result);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      }
    }
    void load();
    return () => { active = false; };
  }, [code, deliveryId]);

  if (info && code) {
    return <CustomerConfirmation deliveryId={info.deliveryId} customer={info.customer} retailer={info.retailer} destination={info.destination} item={info.item} code={code} />;
  }

  return (
    <div className={`w-full max-w-md rounded-2xl border bg-white p-7 text-center shadow-xl ${error ? "border-red-200" : "border-slate-200"}`}>
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${error ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{error ? "!" : "R"}</div>
      <h1 className="mt-5 text-xl font-bold text-slate-950">{error ? "Unable to confirm delivery" : "Checking delivery"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{error || "Verifying this confirmation link with Reflex…"}</p>
    </div>
  );
}
