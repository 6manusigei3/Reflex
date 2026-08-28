"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";

import { validPoint } from "@/lib/maps";
import type { DeliveryMapProps } from "./DeliveryMap";

export default function DeliveryMapClient({
  pickup,
  destination,
  pickupLatitude,
  pickupLongitude,
  destinationLatitude,
  destinationLongitude,
}: DeliveryMapProps) {
  const points = useMemo(() => {
    const result: Array<{
      label: "Pickup" | "Destination";
      address: string;
      position: LatLngTuple;
      color: string;
    }> = [];
    if (validPoint(pickupLatitude, pickupLongitude)) {
      result.push({
        label: "Pickup",
        address: pickup,
        position: [pickupLatitude as number, pickupLongitude as number],
        color: "#2563eb",
      });
    }
    if (validPoint(destinationLatitude, destinationLongitude)) {
      result.push({
        label: "Destination",
        address: destination,
        position: [destinationLatitude as number, destinationLongitude as number],
        color: "#059669",
      });
    }
    return result;
  }, [destination, destinationLatitude, destinationLongitude, pickup, pickupLatitude, pickupLongitude]);

  if (!points.length) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-xl" aria-hidden="true">⌖</div>
        <p className="mt-4 font-bold text-slate-800">Location unavailable for map preview</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">The delivery remains active. Use the written pickup and destination addresses below.</p>
      </div>
    );
  }

  const positions = points.map((point) => point.position);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer
        center={positions[0]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-80 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitPoints points={positions} />
        {points.length > 1 && (
          <Polyline positions={positions} pathOptions={{ color: "#64748b", dashArray: "7 9", weight: 3 }} />
        )}
        {points.map((point) => (
          <CircleMarker
            key={point.label}
            center={point.position}
            radius={9}
            pathOptions={{ color: "#ffffff", fillColor: point.color, fillOpacity: 1, weight: 3 }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent>
              <strong>{point.label}</strong>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2">
        <MapLabel label="Pickup" address={pickup} color="bg-blue-600" />
        <MapLabel label="Destination" address={destination} color="bg-emerald-600" />
      </div>
    </div>
  );
}

function FitPoints({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 15 });
    } else {
      map.setView(points[0], 14);
    }
  }, [map, points]);
  return null;
}

function MapLabel({ label, address, color }: { label: string; address: string; color: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${color}`} />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-700">{address}</p>
      </div>
    </div>
  );
}
