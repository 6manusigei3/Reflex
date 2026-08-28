"use client";

import dynamic from "next/dynamic";
import type { DeliveryCoordinates } from "@/lib/maps";

const DeliveryMapClient = dynamic(() => import("./DeliveryMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">
      Loading map…
    </div>
  ),
});

export type DeliveryMapProps = DeliveryCoordinates & {
  pickup: string;
  destination: string;
};

export default function DeliveryMap(props: DeliveryMapProps) {
  return <DeliveryMapClient {...props} />;
}
