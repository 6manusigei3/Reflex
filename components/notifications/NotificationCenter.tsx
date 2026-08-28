"use client";

import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import type { ApiNotification } from "@/lib/api";
import { useApiList } from "@/lib/use-api-data";

export default function NotificationCenter({
  role,
}: {
  role: "admin" | "retailer" | "dispatcher";
}) {
  const { data, error } = useApiList<ApiNotification>("/notifications", []);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Notifications are temporarily unavailable.
        </div>
      )}
      {data.length ? (
        <div className="divide-y divide-slate-100">
        {data.map((item) => (
          <article
            key={item.id}
            className={`flex gap-4 px-1 py-5 ${item.read ? "" : "rounded-xl bg-blue-50/50"}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${item.type === "confirmation" ? "bg-emerald-50 text-emerald-600" : item.type === "assignment" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
            >
              {item.type === "confirmation"
                ? "✓"
                : item.type === "assignment"
                  ? "↗"
                  : "↻"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <p className="font-semibold text-slate-900">{item.title}</p>
                {!item.read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.message}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-xs text-slate-400">{item.time}</span>
                {item.deliveryId && (
                  <Link
                    href={
                      role === "retailer"
                        ? `/retailer/deliveries/${item.deliveryId}`
                        : role === "admin" ? "/admin/deliveries" : "/dispatcher/deliveries"
                    }
                    className="text-xs font-semibold text-blue-600"
                  >
                    View delivery
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications yet"
          description="New delivery and confirmation activity will appear here."
        />
      )}
    </div>
  );
}
