"use client";

import { useState } from "react";

type LiveEvent = {
  id: number;
  title: string;
  description: string;
  time: string;
};

const initialEvents: LiveEvent[] = [
  {
    id: 1,
    title: "RFX-1013 assigned",
    description:
      "A new delivery was assigned to your rider account.",
    time: "Just now",
  },
  {
    id: 2,
    title: "RFX-1008 updated",
    description:
      "Delivery status changed to In Transit.",
    time: "12 min ago",
  },
];

export default function RealtimeStatusPanel() {
  const [events, setEvents] =
    useState(initialEvents);

  const [connected, setConnected] =
    useState(true);

  function simulateUpdate() {
    const newEvent: LiveEvent = {
      id: Date.now(),
      title: "Demo live update",
      description:
        "A delivery update was received by the Reflex rider interface.",
      time: "Just now",
    };

    setEvents((current) => [
      newEvent,
      ...current,
    ]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          <p className="text-sm font-semibold text-slate-800">
            {connected
              ? "Live updates ready"
              : "Live updates paused"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setConnected(
              (current) => !current
            )
          }
          className="text-xs font-semibold text-slate-500 transition hover:text-blue-600"
        >
          {connected
            ? "Pause demo"
            : "Resume demo"}
        </button>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        This frontend panel is prepared for
        WebSocket events. During integration,
        FastAPI will replace the demo updates
        with real delivery events.
      </p>

      <div className="mt-5 space-y-3">
        {events.slice(0, 4).map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {event.title}
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {event.description}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {event.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {connected && (
        <button
          type="button"
          onClick={simulateUpdate}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
        >
          Simulate Live Update
        </button>
      )}
    </div>
  );
}
