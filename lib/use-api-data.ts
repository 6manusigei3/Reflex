"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ApiError,
  DEMO_FALLBACK_ENABLED,
  apiRequest,
  getErrorMessage,
  getSession,
  getWebSocketUrl,
  type ApiDelivery,
} from "@/lib/api";

const DELIVERY_SNAPSHOT_EVENT = "reflex:delivery-snapshot";
const REALTIME_STATUS_EVENT = "reflex:realtime-status";

export type RealtimeState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

type RealtimeStatus = {
  state: RealtimeState;
  lastUpdated: string | null;
};

let currentRealtimeStatus: RealtimeStatus = {
  state: "connecting",
  lastUpdated: null,
};

function publishRealtimeStatus(status: RealtimeStatus) {
  currentRealtimeStatus = status;
  window.dispatchEvent(
    new CustomEvent<RealtimeStatus>(REALTIME_STATUS_EVENT, {
      detail: status,
    })
  );
}

export function useApiList<T>(path: string, fallback: T[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackRef = useRef(fallback);

  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest<T[]>(path);
      setData(result);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      const offline =
        DEMO_FALLBACK_ENABLED &&
        requestError instanceof ApiError &&
        requestError.status === 0;
      setData((current) =>
        offline
          ? current.length
            ? current
            : fallbackRef.current
          : []
      );
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const handleDeliverySnapshot = useCallback(
    (deliveries: ApiDelivery[]) => {
      if (path.split("?", 1)[0] !== "/deliveries") return;
      setData(deliveries as unknown as T[]);
      setError(null);
      setLoading(false);
    },
    [path]
  );

  useDeliverySnapshots(handleDeliverySnapshot);

  return { data, setData, loading, error, refresh };
}

export function useApiResource<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setData(await apiRequest<T>(path));
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  return { data, loading, error, refresh };
}

export function useDeliverySnapshots(
  onSnapshot: (deliveries: ApiDelivery[]) => void
) {
  const snapshotHandler = useRef(onSnapshot);

  useEffect(() => {
    snapshotHandler.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    function handleSnapshot(event: Event) {
      snapshotHandler.current(
        (event as CustomEvent<ApiDelivery[]>).detail
      );
    }

    window.addEventListener(DELIVERY_SNAPSHOT_EVENT, handleSnapshot);
    return () => {
      window.removeEventListener(DELIVERY_SNAPSHOT_EVENT, handleSnapshot);
    };
  }, []);
}

export function useRealtimeStatus() {
  const [status, setStatus] = useState(currentRealtimeStatus);

  useEffect(() => {
    function handleStatus(event: Event) {
      setStatus((event as CustomEvent<RealtimeStatus>).detail);
    }

    window.addEventListener(REALTIME_STATUS_EVENT, handleStatus);
    return () => {
      window.removeEventListener(REALTIME_STATUS_EVENT, handleStatus);
    };
  }, []);

  return status;
}

export function useDeliveryRealtime() {
  const [state, setState] = useState<RealtimeState>("connecting");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let stopped = false;

    function connect() {
      const token = getSession()?.accessToken;
      if (!token || stopped) {
        setState("offline");
        publishRealtimeStatus({ state: "offline", lastUpdated: null });
        return;
      }

      const connectingState =
        currentRealtimeStatus.state === "connecting"
          ? "connecting"
          : "reconnecting";
      setState(connectingState);
      publishRealtimeStatus({
        state: connectingState,
        lastUpdated: currentRealtimeStatus.lastUpdated,
      });

      try {
        socket = new WebSocket(getWebSocketUrl());
      } catch {
        setState("offline");
        publishRealtimeStatus({ state: "offline", lastUpdated: null });
        return;
      }

      socket.addEventListener("open", () => {
        socket?.send(JSON.stringify({ type: "authenticate", token }));
      });

      socket.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data) as {
            type?: string;
            deliveries?: ApiDelivery[];
          };

          if (message.type === "connected") {
            setState("connected");
            publishRealtimeStatus({
              state: "connected",
              lastUpdated: currentRealtimeStatus.lastUpdated,
            });
          }
          if (message.type === "delivery_snapshot" && message.deliveries) {
            const updatedAt = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            window.dispatchEvent(
              new CustomEvent<ApiDelivery[]>(DELIVERY_SNAPSHOT_EVENT, {
                detail: message.deliveries,
              })
            );
            setLastUpdated(updatedAt);
            setState("connected");
            publishRealtimeStatus({
              state: "connected",
              lastUpdated: updatedAt,
            });
          }
        } catch {
          // Ignore malformed messages and keep the last good snapshot.
        }
      });

      socket.addEventListener("close", () => {
        if (stopped) return;
        setState("reconnecting");
        publishRealtimeStatus({
          state: "reconnecting",
          lastUpdated: currentRealtimeStatus.lastUpdated,
        });
        reconnectTimer = window.setTimeout(connect, 3000);
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    }

    connect();
    return () => {
      stopped = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
      publishRealtimeStatus({
        state: "offline",
        lastUpdated: currentRealtimeStatus.lastUpdated,
      });
    };
  }, []);

  return { state, lastUpdated };
}
