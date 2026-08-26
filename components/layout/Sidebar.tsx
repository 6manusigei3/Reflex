"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type UserRole = "retailer" | "dispatcher" | "rider";

type SidebarProps = {
  role: UserRole;
  open: boolean;
  onClose: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "plus"
    | "package"
    | "history"
    | "bell"
    | "settings"
    | "users"
    | "requests";
};

const roleNavigation: Record<UserRole, NavItem[]> = {
  retailer: [
    {
      label: "Overview",
      href: "/retailer",
      icon: "dashboard",
    },
    {
      label: "New Delivery",
      href: "/retailer/new-delivery",
      icon: "plus",
    },
    {
      label: "My Deliveries",
      href: "/retailer/deliveries",
      icon: "package",
    },
    {
      label: "Delivery History",
      href: "/retailer/history",
      icon: "history",
    },
    {
      label: "Notifications",
      href: "/retailer/notifications",
      icon: "bell",
    },
  ],

  dispatcher: [
    {
      label: "Overview",
      href: "/dispatcher",
      icon: "dashboard",
    },
    {
      label: "Open Requests",
      href: "/dispatcher/requests",
      icon: "requests",
    },
    {
      label: "Deliveries",
      href: "/dispatcher/deliveries",
      icon: "package",
    },
    {
      label: "Riders",
      href: "/dispatcher/riders",
      icon: "users",
    },
    {
      label: "Delivery History",
      href: "/dispatcher/history",
      icon: "history",
    },
    {
      label: "Notifications",
      href: "/dispatcher/notifications",
      icon: "bell",
    },
  ],

  rider: [
    {
      label: "Overview",
      href: "/rider",
      icon: "dashboard",
    },
    {
      label: "My Deliveries",
      href: "/rider/deliveries",
      icon: "package",
    },
    {
      label: "Delivery History",
      href: "/rider/history",
      icon: "history",
    },
    {
      label: "Notifications",
      href: "/rider/notifications",
      icon: "bell",
    },
  ],
};

function Icon({ name }: { name: NavItem["icon"] | "logout" }) {
  const common =
    "h-5 w-5 shrink-0";

  if (name === "dashboard") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 5v14M5 12h14" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "package") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="m4 7 8 4 8-4M12 11v10" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M3 12a9 9 0 1 0 3-6.7L3 8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M3 3v5h5M12 7v5l3 2" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12"
