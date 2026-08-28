import type { DeliveryPriority, DeliveryStatus } from "@/lib/delivery";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const DEMO_FALLBACK_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === "true";

export type UserRole = "admin" | "retailer" | "dispatcher" | "rider";
export type AccountStatus = "pending" | "active" | "rejected" | "suspended";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string | null;
  phone: string | null;
  accountStatus: AccountStatus;
};

export type ApiDelivery = {
  id: string;
  retailer: string;
  customer: string;
  phone: string;
  customerPhone: string;
  pickup: string;
  destination: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  item: string;
  deliveryNotes: string | null;
  rider: string | null;
  riderPhone: string | null;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  createdAt: string;
  updatedAt: string;
  assignedAt: string | null;
  confirmationStatus: "not_ready" | "awaiting_confirmation" | "confirmed";
};

export type ApiRider = {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  activeDeliveries: number;
};

export type ApiNotification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "assignment" | "status" | "confirmation" | "system";
  read: boolean;
  deliveryId?: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: ApiUser;
};

const SESSION_KEY = "reflex.session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    window.sessionStorage.getItem(SESSION_KEY) ??
    window.localStorage.getItem(SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: AuthSession, remember: boolean) {
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(SESSION_KEY);
  target.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateSessionUser(user: ApiUser) {
  if (typeof window === "undefined") return;
  const session = getSession();
  if (!session) return;
  const storage = window.localStorage.getItem(SESSION_KEY)
    ? window.localStorage
    : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify({ ...session, user }));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getSession()?.accessToken;
    if (!token) throw new ApiError("Please sign in to continue.", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "The Reflex API is unavailable. Check that the backend is running.",
      0
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      payload && typeof payload.detail === "string"
        ? payload.detail
        : "The request could not be completed.";
    throw new ApiError(detail, response.status);
  }

  return payload as T;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function getWebSocketUrl() {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/api/ws/deliveries";
  return url.toString();
}
