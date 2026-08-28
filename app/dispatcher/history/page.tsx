"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";

import {
  retailerDeliveries,
  type RetailerDelivery,
} from "@/lib/mock-deliveries";
import { useApiList } from "@/lib/use-api-data";

export default function DispatcherHistoryPage() {
  const { data } = useApiList<RetailerDelivery>("/deliveries", retailerDeliveries);
  const completed = data.filter(
    (delivery) =>
      delivery.status === "completed" ||
      delivery.status === "delivered"
  );

  return (
    <DashboardShell
      role="dispatcher"
      userName="A. Wanjala"
    >
      <PageHeader
        eyebrow="Dispatcher workspace"
        title="Delivery History"
        description="Review deliveries that have reached the final stages of the delivery process."
      />

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <Header>Delivery</Header>
                <Header>Customer</Header>
                <Header>Rider</Header>
                <Header>Destination</Header>
                <Header>Status</Header>
                <Header>Completed / Updated</Header>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {completed.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-bold text-blue-600">
                    {delivery.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {delivery.customer}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {delivery.rider}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {delivery.destination}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={delivery.status}
                      size="sm"
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {delivery.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}

function Header({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
