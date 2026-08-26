import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { DeliveryStatus } from "@/lib/delivery";

type Delivery = {
  id: string;
  customer: string;
  destination: string;
  rider: string;
  status: DeliveryStatus;
  createdAt: string;
};

const deliveries: Delivery[] = [
  {
    id: "RFX-1008",
    customer: "Grace Wanjiku",
    destination: "Kilimani, Nairobi",
    rider: "David Mwangi",
    status: "in_transit",
    createdAt: "26 Aug, 2:30 PM",
  },
  {
    id: "RFX-1007",
    customer: "Brian Otieno",
    destination: "Westlands, Nairobi",
    rider: "Kevin Kiptoo",
    status: "picked_up",
    createdAt: "26 Aug, 1:15 PM",
  },
  {
    id: "RFX-1006",
    customer: "Mercy Achieng",
    destination: "Lavington, Nairobi",
    rider: "Not assigned",
    status: "pending",
    createdAt: "26 Aug, 11:42 AM",
  },
  {
    id: "RFX-1005",
    customer: "Peter Kamau",
    destination: "South B, Nairobi",
    rider: "Samuel Maina",
    status: "completed",
    createdAt: "26 Aug, 9:25 AM",
  },
  {
    id: "RFX-1004",
    customer: "Faith Njeri",
    destination: "Parklands, Nairobi",
    rider: "James Kariuki",
    status: "delivered",
    createdAt: "25 Aug, 4:10 PM",
  },
];

export default function RecentDeliveries() {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivery
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Destination
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rider
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Created
            </th>

            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {deliveries.map((delivery) => (
            <tr
              key={delivery.id}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="px-5 py-4">
                <Link
                  href={`/retailer/deliveries/${delivery.id}`}
                  className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  {delivery.id}
                </Link>
              </td>

              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {delivery.customer}
                </p>
              </td>

              <td className="px-5 py-4">
                <p className="text-sm text-slate-600">
                  {delivery.destination}
                </p>
              </td>

              <td className="px-5 py-4">
                <p
                  className={`text-sm ${
                    delivery.rider === "Not assigned"
                      ? "italic text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {delivery.rider}
                </p>
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={delivery.status}
                  size="sm"
                />
</td>

              <td className="px-5 py-4">
                <p className="text-sm text-slate-500">
                  {delivery.createdAt}
                </p>
              </td>

              <td className="px-5 py-4 text-right">
                <Link
                  href={`/retailer/deliveries/${delivery.id}`}
                  className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
