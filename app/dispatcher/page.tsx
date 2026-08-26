import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import OpenRequestsTable from "@/components/dispatcher/OpenRequestsTable";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatCard from "@/components/ui/StatCard";

import {
  dispatcherRequests,
  reflexRiders,
} from "@/lib/mock-dispatcher";

function RequestIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        strokeWidth="1.8"
      />

      <path
        d="M8 8h8M8 12h8M8 16h5"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RiderIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="8"
        r="3"
        strokeWidth="1.8"
      />

      <path
        d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M3 7h11v10H3V7ZM14 10h4l3 3v4h-7"
        strokeWidth="1.8"
      />

      <circle cx="7" cy="18" r="2" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        strokeWidth="1.8"
      />

      <path
        d="m8 12 2.5 2.5L16 9"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DispatcherDashboard() {
  const openRequests =
    dispatcherRequests.filter(
      (request) => request.status === "pending"
    ).length;

  const availableRiders =
    reflexRiders.filter(
      (rider) => rider.available
    ).length;

  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Dispatch Overview"
        description="Manage incoming delivery requests, rider assignments and active deliveries."
      />

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Open Requests"
          value={openRequests}
          description="waiting for assignment"
          icon={<RequestIcon />}
        />

        <StatCard
          title="Available Riders"
          value={availableRiders}
          description="ready for assignment"
          icon={<RiderIcon />}
        />

        <StatCard
          title="Active Deliveries"
          value="9"
          description="currently in progress"
          icon={<TruckIcon />}
        />

        <StatCard
          title="Completed Today"
          value="18"
          description="successfully completed"
          icon={<CheckIcon />}
        />
      </section>

      <section className="mt-6">
        <SectionCard
          title="Open Delivery Requests"
          description="Assign available riders to new retailer delivery requests."
          action={
            <Link
              href="/dispatcher/requests"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all requests
            </Link>
          }
        >
          <OpenRequestsTable
            initialRequests={dispatcherRequests}
            riders={reflexRiders}
          />
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
