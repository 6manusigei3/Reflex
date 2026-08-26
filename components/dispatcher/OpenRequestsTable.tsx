"use client";

import { useMemo, useState } from "react";

import AssignRiderModal from "./AssignRiderModal";
import StatusBadge from "@/components/ui/StatusBadge";

import type {
  DispatcherRequest,
  Rider,
} from "@/lib/mock-dispatcher";

type OpenRequestsTableProps = {
  initialRequests: DispatcherRequest[];
  riders: Rider[];
};

export default function OpenRequestsTable({
  initialRequests,
  riders,
}: OpenRequestsTableProps) {
  const [requests, setRequests] =
    useState(initialRequests);

  const [search, setSearch] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState<DispatcherRequest | null>(null);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (!term) {
        return true;
      }

      return (
        request.id.toLowerCase().includes(term) ||
        request.retailer.toLowerCase().includes(term) ||
        request.customer.toLowerCase().includes(term) ||
        request.destination.toLowerCase().includes(term)
      );
    });
  }, [requests, search]);

  function assignRider(rider: Rider) {
    if (!selectedRequest) {
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              rider: rider.name,
              status: "assigned",
            }
          : request
      )
    );

    setSelectedRequest(null);
  }

  return (
    <>
      <div className="mb-5"><div className="relative max-w-md">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              strokeWidth="1.8"
            />

            <path
              d="m20 20-4-4"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search requests..."
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50">
              <Header>Request</Header>
              <Header>Retailer</Header>
              <Header>Customer</Header>
              <Header>Destination</Header>
              <Header>Priority</Header>
              <Header>Status</Header>
              <Header>Rider</Header>
              <Header align="right">Action</Header>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map((request) => (
              <tr
                key={request.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-blue-600">
                    {request.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {request.createdAt}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {request.retailer}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {request.customer}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {request.phone}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {request.destination}
                </td>

                <td className="px-5 py-4">
                  <PriorityBadge
                    priority={request.priority}
                  />
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    status={request.status}
                    size="sm"
                  />
                </td>

                <td className="px-5 py-4">
                  {request.rider ? (
                    <p className="text-sm font-medium text-slate-700">
                      {request.rider}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      Unassigned
                    </p>
                  )}
                </td>

                <td className="px-5 py-4 text-right">
                  {request.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRequest(request)
                      }
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Assign Rider
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-emerald-600">
                      Assigned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-900">
              No requests found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search.
            </p>
          </div>
        )}
      </div>

      <AssignRiderModal
        request={selectedRequest}
        riders={riders}
        onClose={() =>
          setSelectedRequest(null)
        }
        onAssign={assignRider}
      />
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
        align === "right"? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: DispatcherRequest["priority"];
}) {
  const styles = {
    normal: "bg-slate-100 text-slate-600",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
