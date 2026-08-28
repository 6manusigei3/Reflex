"use client";

import { useCallback, useState } from "react";
import { deliveryStatusLabels } from "@/lib/delivery";
import type { ApiDelivery } from "@/lib/api";
import {
  useDeliverySnapshots,
  useRealtimeStatus,
} from "@/lib/use-api-data";

type LiveEvent = { id: string; title: string; description: string; time: string };

export default function RealtimeStatusPanel() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const handleSnapshot = useCallback((deliveries: ApiDelivery[]) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setEvents(
      deliveries.slice(0, 4).map((delivery) => ({
        id: delivery.id,
        title: `${delivery.id} ${deliveryStatusLabels[delivery.status].toLowerCase()}`,
        description: `${delivery.customer} • ${delivery.destination}`,
        time,
      }))
    );
  }, []);
  useDeliverySnapshots(handleSnapshot);
  const { state, lastUpdated } = useRealtimeStatus();
  const connected = state === "connected";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" : state === "reconnecting" ? "animate-pulse bg-amber-500" : "bg-slate-400"}`} />
          <p className="text-sm font-semibold text-slate-800">
            {connected ? "Realtime connected" : state === "reconnecting" ? "Reconnecting…" : state === "connecting" ? "Connecting…" : "Realtime offline"}
          </p>
        </div>
        {lastUpdated && <p className="text-[11px] font-medium text-slate-400">Updated {lastUpdated}</p>}
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        Delivery snapshots arrive securely over the authenticated Reflex WebSocket. The latest received snapshot remains visible if the connection drops.
      </p>

      <div className="mt-5 space-y-3">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition hover:border-blue-200">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{event.description}</p>
                  <p className="mt-2 text-xs text-slate-400">{event.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            Live delivery activity will appear after the first realtime snapshot arrives.
          </div>
        )}
      </div>
    </div>
  );
}
