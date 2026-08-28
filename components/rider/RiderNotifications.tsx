"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  RiderNotification,
} from "@/lib/mock-rider-notifications";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { useApiList } from "@/lib/use-api-data";
import EmptyState from "@/components/ui/EmptyState";

type RiderNotificationsProps = {
  initialNotifications: RiderNotification[];
};

export default function RiderNotifications({
  initialNotifications,
}: RiderNotificationsProps) {
  const {
    data: notifications,
    setData: setNotifications,
    error,
  } = useApiList<RiderNotification>("/notifications", initialNotifications);
  const [actionError, setActionError] = useState("");

  const unread =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  async function markAllRead() {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      window.dispatchEvent(new Event("reflex:notifications-changed"));
      setActionError("");
    } catch (markError) {
      setActionError(getErrorMessage(markError));
    }
  }

  async function markRead(id: number) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
      window.dispatchEvent(new Event("reflex:notifications-changed"));
      setActionError("");
    } catch (markError) {
      setActionError(getErrorMessage(markError));
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Notifications are unavailable. Reconnect to the Reflex API to continue.
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {unread}
          </span>{" "}
          unread notifications
        </p>

        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {notifications.map(
          (notification) => (
            <article
              key={notification.id}
              className={`py-5 ${
                notification.read
                  ? ""
                  : "bg-blue-50/40"
              }`}
            >
              <div className="flex gap-4 px-2">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconStyle(
                    notification.type
                  )}`}
                >
                  {getIcon(
                    notification.type
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {
                          notification.title
                        }
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {
                          notification.message
                        }
                      </p>
                    </div>

                    {!notification.read && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <p className="text-xs text-slate-400">
                      {notification.time}
                    </p>

                    {notification.deliveryId && (
                      <Link
                        href={`/rider/deliveries/${notification.deliveryId}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View delivery
                      </Link>
                    )}

                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => void markRead(notification.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        )}
      </div>
      {!notifications.length && (
        <EmptyState title="No notifications yet" description="New assignments, delivery updates and confirmations will appear here." />
      )}
    </div>
  );
}

function getIcon(
  type: RiderNotification["type"]
) {
  if (type === "assignment") {
    return "↗";
  }

  if (type === "confirmation") {
    return "✓";
  }

  if (type === "status") {
    return "↻";
  }

  return "i";
}

function getIconStyle(
  type: RiderNotification["type"]
) {
  if (type === "assignment") {
    return "bg-blue-50 text-blue-600";
  }

  if (type === "confirmation") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (type === "status") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-slate-100 text-slate-600";
}
