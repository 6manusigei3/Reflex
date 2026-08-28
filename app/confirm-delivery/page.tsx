import PublicConfirmation from "@/components/rider/PublicConfirmation";

export default async function ConfirmDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ delivery?: string; code?: string }>;
}) {
  const { delivery, code } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0,transparent_38%),#f8fafc] px-5 py-10">
      <PublicConfirmation deliveryId={delivery} code={code} />
    </main>
  );
}
