"use client";

import { useState } from "react";

type CustomerConfirmationProps = {
  deliveryId: string;
  customer: string;
  retailer: string;
  destination: string;
  item: string;
};

export default function CustomerConfirmation({
  deliveryId,
  customer,
  retailer,
  destination,
  item,
}: CustomerConfirmationProps) {
  const [confirmed, setConfirmed] =
    useState(false);

  if (confirmed) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Delivery confirmed
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Thank you. Delivery{" "}
          <span className="font-semibold text-slate-700">
            {deliveryId}
          </span>{" "}
          has been confirmed as received.
        </p>

        <div className="mt-6 rounded-xl bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">
            Confirmation successful
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
          R
        </div>

        <div>
          <p className="font-bold text-slate-950">
            Reflex
          </p>

          <p className="text-xs text-slate-500">
            Delivery Confirmation
          </p>
        </div>
      </div>

      <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">
        Confirm your delivery
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Please check the delivery information
        before confirming that you received the
        package.
      </p>

      <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
        <Info
          label="Delivery ID"
          value={deliveryId}
        />

        <Info
          label="Customer"
          value={customer}
        />

        <Info
          label="Retailer"
          value={retailer}
        />

        <Info
          label="Destination"
          value={destination}
        />

        <Info
          label="Package"
          value={item}
        />
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm leading-6 text-amber-800">
          Only confirm if the package has actually
          been received.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          setConfirmed(true)
        }
        className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
      >
        Confirm Package Received
      </button>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
