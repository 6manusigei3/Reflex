import {
  DeliveryStatus,
  deliveryStatusLabels,
} from "@/lib/delivery";

type StatusBadgeProps = {
  status: DeliveryStatus;
  size?: "sm" | "md";
};

const statusStyles: Record<
  DeliveryStatus,
  string
> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700",

  assigned:
    "border-blue-200 bg-blue-50 text-blue-700",

  picked_up:
    "border-violet-200 bg-violet-50 text-violet-700",

  in_transit:
    "border-sky-200 bg-sky-50 text-sky-700",

  delivered:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  completed:
    "border-green-200 bg-green-50 text-green-700",

  failed:
    "border-red-200 bg-red-50 text-red-700",

  cancelled:
    "border-slate-300 bg-slate-100 text-slate-600",
};

const dotStyles: Record<
  DeliveryStatus,
  string
> = {
  pending: "bg-amber-500",
  assigned: "bg-blue-500",
  picked_up: "bg-violet-500",
  in_transit: "bg-sky-500",
  delivered: "bg-emerald-500",
  completed: "bg-green-600",
  failed: "bg-red-500",
  cancelled: "bg-slate-500",
};

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-1 text-[11px]"
      : "px-2.5 py-1.5 text-xs";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full
        border font-semibold
        ${statusStyles[status]}
        ${sizeClasses}
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`}
      />

      {deliveryStatusLabels[status]}
    </span>
  );
}
