"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  QRCodeSVG,
} from "qrcode.react";

import {
  getConfirmationCode,
} from "@/lib/confirmation";

type QRConfirmationProps = {
  deliveryId: string;
  customer: string;
  destination: string;
};

export default function QRConfirmation({
  deliveryId,
  customer,
  destination,
}: QRConfirmationProps) {
  const [confirmationUrl, setConfirmationUrl] =
    useState("");

  const confirmationCode =
    getConfirmationCode(deliveryId);

  useEffect(() => {
    const url =
      `${window.location.origin}` +
      `/confirm-delivery` +
      `?delivery=${encodeURIComponent(
        deliveryId
      )}` +
      `&code=${encodeURIComponent(
        confirmationCode
      )}`;

    setConfirmationUrl(url);
  }, [
    deliveryId,
    confirmationCode,
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex w-fit items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
          {confirmationUrl ? (
            <QRCodeSVG
              value={confirmationUrl}
              size={220}
              level="H"
            />
          ) : (
            <div className="h-[220px] w-[220px] animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>

        <h2 className="mt-5 font-bold text-slate-950">
          Scan to confirm delivery
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ask the customer to scan this QR code
          using their phone camera.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Confirmation code
          </p>

          <p className="mt-2 font-mono text-2xl font-bold tracking-[0.22em] text-slate-950">
            {confirmationCode}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-600">
          Final delivery step
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Awaiting customer confirmation
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          The rider has delivered the package.
          Customer confirmation completes the
          delivery workflow.
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
            label="Destination"
            value={destination}
          />
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">
            How confirmation works
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            The QR code opens a customer-facing
            confirmation page. The customer reviews
            the delivery and confirms that the
            package was received.
          </p>
        </div>
      </section>
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
