import Link from "next/link";

import StatusBadge from "@/components/ui/StatusBadge";

import type {
  RiderDelivery,
} from "@/lib/mock-rider";

type RiderHistoryListProps = {
  deliveries: RiderDelivery[];
};

export default function RiderHistoryList({
  deliveries,
}: RiderHistoryListProps) {
  if (deliveries.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
          ✓
        </div>

        <p className="mt-4 font-semibold text-slate-900">
          No delivery history yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Completed deliveries will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <Header>Delivery</Header>
              <Header>Customer</Header>
              <Header>Route</Header>
              <Header>Retailer</Header>
              <Header>Status</Header>
              <Header>Last Updated</Header>
              <Header align="right">
                Action
              </Header>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {deliveries.map((delivery) => (
              <tr
                key={delivery.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-blue-600">
                    {delivery.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {delivery.assignedAt}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {delivery.customer}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {delivery.customerPhone}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {delivery.pickup}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    → {delivery.destination}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {delivery.retailer}
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

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/rider/deliveries/${delivery.id}`}
                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {deliveries.map((delivery) => (
          <Link
            key={delivery.id}
            href={`/rider/deliveries/${delivery.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-950">
                  {delivery.id}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {delivery.customer}
                </p>
              </div>

              <StatusBadge
                status={delivery.status}
                size="sm"
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Destination
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {delivery.destination}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function Header({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
