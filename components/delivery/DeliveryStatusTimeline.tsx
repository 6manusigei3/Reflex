import {
  DeliveryStatus,
  deliveryStatusLabels,
  mainDeliveryFlow,
} from "@/lib/delivery";

type DeliveryStatusTimelineProps = {
  currentStatus: DeliveryStatus;
};

export default function DeliveryStatusTimeline({
  currentStatus,
}: DeliveryStatusTimelineProps) {
  const currentIndex =
    mainDeliveryFlow.indexOf(currentStatus);

  const isException =
    currentStatus === "failed" ||
    currentStatus === "cancelled";

  if (isException) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          Delivery {deliveryStatusLabels[currentStatus]}
        </p>

        <p className="mt-1 text-sm text-red-600">
          This delivery is no longer following the normal delivery
          process.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[720px] items-start">
        {mainDeliveryFlow.map(
          (status, index) => {
            const completed =
              index <= currentIndex;

            const active =
              index === currentIndex;

            const last =
              index ===
              mainDeliveryFlow.length - 1;

            return (
              <div
                key={status}
                className="flex flex-1 items-start"
              >
                <div className="flex min-w-[92px] flex-col items-center text-center">
                  <div
                    className={`
                      flex h-9 w-9 items-center justify-center
                      rounded-full border-2 text-xs font-bold
                      ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-slate-400"
                      }
                    `}
                  >
                    {completed && !active ? (
                      <span aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      index + 1
                    )}
                  </div>

                  <p
                    className={`
                      mt-2 text-xs font-semibold
                      ${
                        active
                          ? "text-blue-700"
                          : completed
                            ? "text-slate-800"
                            : "text-slate-400"
                      }
                    `}
                  >
                    {deliveryStatusLabels[status]}
                  </p>
                </div>

                {!last && (
                  <div
                    className={`
                      mt-[17px] h-0.5 flex-1
                      ${
                        index < currentIndex
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }
                    `}
                  />
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
