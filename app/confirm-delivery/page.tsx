import {
  retailerDeliveries,
} from "@/lib/mock-deliveries";

import CustomerConfirmation from "@/components/rider/CustomerConfirmation";

import {
  isValidConfirmationCode,
} from "@/lib/confirmation";

type ConfirmDeliveryPageProps = {
  searchParams: Promise<{
    delivery?: string;
    code?: string;
  }>;
};

export default async function ConfirmDeliveryPage({
  searchParams,
}: ConfirmDeliveryPageProps) {
  const {
    delivery: deliveryId,
    code,
  } = await searchParams;

  const delivery =
    retailerDeliveries.find(
      (item) =>
        item.id === deliveryId
    );

  const valid =
    delivery &&
    deliveryId &&
    code &&
    isValidConfirmationCode(
      deliveryId,
      code
    );

  if (!delivery || !valid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Invalid confirmation
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This delivery confirmation link is
            invalid or incomplete.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <CustomerConfirmation
        deliveryId={delivery.id}
        customer={delivery.customer}
        retailer="MetroTech Electronics"
        destination={
          delivery.destination
        }
        item={delivery.item}
      />
    </main>
  );
}
