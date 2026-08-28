import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import RecentDeliveries from "@/components/retailer/RecentDeliveries";
import RetailerActivity from "@/components/retailer/RetailerActivity";
import RetailerStats from "@/components/retailer/RetailerStats";

function PackageIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="m4 7 8 4 8-4M12 11v10"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function RetailerDashboard() {
  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <PageHeader
        eyebrow="Retailer workspace"
        title="Delivery Overview"
        description="Here is what is happening with your deliveries today."
        action={
          <Link
            href="/retailer/new-delivery"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <span className="text-lg leading-none">
              +
            </span>

            New Delivery
          </Link>
        }
      />

      <RetailerStats />

      <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard
          title="Recent Deliveries"
          description="Your latest delivery requests and their current status."
          action={
            <Link
              href="/retailer/deliveries"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View all
            </Link>
          }
        >
          <RecentDeliveries />
          </SectionCard>

        <SectionCard
          title="Recent Activity"
          description="Latest updates from your deliveries."
        >
          <RetailerActivity />
        </SectionCard>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/retailer/new-delivery"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            +
          </div>

          <h3 className="mt-4 font-semibold text-slate-950">
            Create Delivery
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add a new customer delivery request.
          </p>
        </Link>

        <Link
          href="/retailer/deliveries"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <PackageIcon />
          </div>

          <h3 className="mt-4 font-semibold text-slate-950">
            Track Deliveries
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            View the current progress of active deliveries.
          </p>
        </Link>

        <Link
          href="/retailer/history"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <span className="text-lg font-bold">✓</span>
          </div>

          <h3 className="mt-4 font-semibold text-slate-950">
            Delivery History
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review previous completed deliveries.
          </p>
        </Link>
      </section>
    </DashboardShell>
  );
}
